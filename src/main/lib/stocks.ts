import { IpcMainInvokeEvent } from "electron";
import _ from "lodash";
import fetch from "node-fetch";

import { Portfolio } from "../../../types";

const Alpaca = require("@alpacahq/alpaca-trade-api");

const APCA_API_KEY_ID = "PKEQQ7F6HZ1904PSCJIC";
const APCA_API_SECRET_KEY = "zWD5pmztyE7ckbQHtXqPbe6JCRkTnATNZXXo8t8w";

const ALPHAVANTAGE_API_KEY = "2PDSAV7CYDC8G2WQ";

export const fetchStockQuotes = async (
    _event: IpcMainInvokeEvent,
    tickerSymbols: string[]
) => {
    try {
        const alpaca = new Alpaca({
            keyId: APCA_API_KEY_ID,
            secretKey: APCA_API_SECRET_KEY,
            paper: true
        });

        const quotes = Object.fromEntries(
            await alpaca.getLatestTrades(tickerSymbols)
        );

        return _.mapValues(quotes, "Price");
    } catch (err) {
        console.error(
            `something went wrong with alpaca getting stock quotes: ${err}`
        );
        throw err;
    }
};

export const getAssetData = async (
    _event: IpcMainInvokeEvent,
    portfolio: Portfolio
) => {
    try {
        const { assets } = portfolio;
        const tickerSymbols = _.map(
            _.slice(assets, 0, assets.length - 1),
            ({ symbol }) => symbol
        );

        let stockPrices: Record<string, number> = {};
        if (tickerSymbols.length) {
            stockPrices = await fetchStockQuotes(_event, tickerSymbols);
        }

        if (Object.keys(stockPrices).length || assets.length === 1) {
            let assetData = _.map(assets, (asset) => {
                const { symbol, quantity, costBasis } = asset;

                if (symbol === "Cash") {
                    return {
                        ...asset,
                        price: 1,
                        marketValue: quantity * costBasis,
                        dollarGain: 0,
                        percentGain: 0
                    };
                }

                const price = stockPrices[symbol];
                const profitPerShare = costBasis ? price - costBasis : 0;
                const marketValue = quantity * price;
                const percentGain = costBasis
                    ? (profitPerShare / costBasis) * 100
                    : 0;
                return {
                    ...asset,
                    price,
                    marketValue,
                    dollarGain: profitPerShare * quantity,
                    percentGain
                };
            });

            const totalPortfolioValue = _.sum(
                _.map(assetData, ({ marketValue }) => marketValue)
            );

            assetData = _.map(assetData, (asset) => ({
                ...asset,
                allocation: totalPortfolioValue
                    ? (asset.marketValue / totalPortfolioValue) * 100
                    : 0
            }));

            portfolio.assets = assetData;
        }
    } catch (err) {
        console.error(
            `something went wrong with fetching stock quotes: ${err}`
        );
    }
};

export const fetchStockInfo = async (tickerSymbol: string) => {
    try {
        const response = await fetch(
            `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${tickerSymbol}&apikey=${ALPHAVANTAGE_API_KEY}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "request"
                }
            }
        );

        const { Name: name, Sector: sector } = (await response.json()) as {
            Name: string;
            Sector: string;
        };

        return {
            symbol: tickerSymbol,
            description: name,
            sector: _.startCase(_.toLower(sector)),
            quantity: 0,
            costBasis: 0
        };
    } catch (err) {
        console.error(`Something went wrong with fetching stock quote: ${err}`);
        return null;
    }
};

export default fetchStockInfo;
