import "dotenv/config";
import _ from "lodash";
import fetch from "node-fetch";

import { Portfolio } from "../../../types";

const Alpaca = require("@alpacahq/alpaca-trade-api");

export const fetchStockQuotes = async (portfolio: Portfolio) => {
    try {
        const alpaca = new Alpaca({
            keyId: process.env.APCA_API_KEY_ID,
            secretKey: process.env.APCA_API_SECRET_KEY,
            paper: true
        });

        const { assets } = portfolio;
        const stockTickers = _.map(
            _.slice(assets, 0, assets.length - 1),
            ({ symbol }) => symbol
        );

        let stockPrices: Record<string, number> = {};
        if (stockTickers.length) {
            const quotes = Object.fromEntries(
                await alpaca.getLatestTrades(stockTickers)
            );

            stockPrices = _.mapValues(quotes, "Price");
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
                const marketValue = quantity * costBasis;
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

export const fetchStockInfo = async (stockTicker: string) => {
    try {
        const response = await fetch(
            `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockTicker}&apikey=${process.env.ALPHAVANTAGE_API_KEY}`,
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
            symbol: stockTicker,
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
