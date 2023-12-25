import { IpcMainInvokeEvent } from "electron";
import _ from "lodash";
import fetch from "node-fetch";
import Alpaca from "@alpacahq/alpaca-trade-api";

// TODO: figure out how to move these to an env file
const APCA_API_KEY_ID = "PKEQQ7F6HZ1904PSCJIC";
const APCA_API_SECRET_KEY = "zWD5pmztyE7ckbQHtXqPbe6JCRkTnATNZXXo8t8w";

const alpaca = new Alpaca({
  keyId: APCA_API_KEY_ID,
  secretKey: APCA_API_SECRET_KEY,
  paper: true,
});

const ALPHAVANTAGE_API_KEY = "2PDSAV7CYDC8G2WQ";

export const fetchStockQuotes = async (
  _event: IpcMainInvokeEvent,
  tickerSymbols: string[]
): Promise<{
  [tickerSymbol: string]: number;
}> => {
  try {
    const latestTrades = await alpaca.getLatestTrades(tickerSymbols);
    const quotes = Object.fromEntries(latestTrades);

    return Object.entries(quotes).reduce((acc, [tickerSymbol, quote]) => {
      acc[tickerSymbol] = quote.Price;
      return acc;
    }, {} as Record<string, number>);
  } catch (err) {
    console.error(`something went wrong with alpaca getting stock quotes: ${err}`);
    return {};
  }
};

export const fetchStockQuote = async (
  _event: IpcMainInvokeEvent,
  tickerSymbol: string
): Promise<number | undefined> => {
  const stockQuotes = await fetchStockQuotes(_event, [tickerSymbol]);
  return stockQuotes[tickerSymbol];
};

export const fetchStockInfo = async (tickerSymbol: string) => {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${tickerSymbol}&apikey=${ALPHAVANTAGE_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "request",
        },
      }
    );

    const { Name: name, Sector: sector } = (await response.json()) as {
      Name: string;
      Sector: string;
    };

    return {
      symbol: tickerSymbol,
      description: name,
      sector: _.startCase(sector.toLowerCase()),
      quantity: 0,
      costBasis: 0,
    };
  } catch (err) {
    console.error(`Something went wrong with fetching stock quote: ${err}`);
    return null;
  }
};
