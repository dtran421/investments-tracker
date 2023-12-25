import { IpcMainInvokeEvent } from "electron";
import _ from "lodash";
import { Asset, LowDB, Portfolio } from "../../renderer/types/db";
import { getPortfolioFromDB, withDB } from "./db";
import { fetchStockInfo, fetchStockQuotes } from "../api/stocks";

export const updatePortfolioAssetData = async (
  _event: IpcMainInvokeEvent,
  db: LowDB,
  portfolio: Portfolio
): Promise<Portfolio> => {
  const tickerSymbols = [...portfolio.assets].map((asset) => asset.symbol);

  if (!tickerSymbols.length) {
    return portfolio;
  }

  try {
    const stockPrices = await fetchStockQuotes(_event, tickerSymbols);

    if (!Object.keys(stockPrices).length) {
      return portfolio;
    }

    const assetData = portfolio.assets.map((asset) => {
      if (asset.symbol === "Cash") {
        return {
          ...asset,
          price: 1,
          marketValue: asset.quantity * asset.costBasis,
          dollarGain: 0,
          percentGain: 0,
        };
      }

      const price = stockPrices[asset.symbol];
      const profitPerShare = asset.costBasis ? price - asset.costBasis : 0;

      return {
        ...asset,
        price,
        marketValue: asset.quantity * price,
        dollarGain: profitPerShare * asset.quantity,
        percentGain: asset.costBasis ? (profitPerShare / asset.costBasis) * 100 : 0,
      };
    });

    const totalPortfolioValue = assetData.reduce((sum, asset) => sum + asset.marketValue, 0);

    portfolio.assets = assetData.map((asset) => ({
      ...asset,
      allocation: totalPortfolioValue ? (asset.marketValue / totalPortfolioValue) * 100 : 0,
    }));

    await db.write();
    return portfolio;
  } catch (err) {
    console.error(`something went wrong with fetching stock quotes: ${err}`);
    return portfolio;
  }
};

export const updateStockAsset = withDB(
  async (
    _event: IpcMainInvokeEvent,
    db: LowDB,
    portfolioSlug: string,
    tickerSymbol: string,
    // * can only be undefined if adding new asset
    asset?: Asset
  ) => {
    const portfolio = await getPortfolioFromDB(db, portfolioSlug);

    if (!portfolio) {
      // TODO: change this to account for non-existent portfolio
      console.error("portfolio not found");
      return null;
    }

    if (!asset) {
      const stockQuote = await fetchStockInfo(tickerSymbol);

      if (!stockQuote) {
        console.error("couldn't add new asset");
        return null;
      }

      portfolio.assets.unshift(stockQuote);
      return portfolio;
    }

    const index = portfolio.assets.findIndex((asset) => asset.symbol === tickerSymbol);
    portfolio.assets[index] = asset;

    return await updatePortfolioAssetData(_event, db, portfolio);
  }
);

export const deleteStockAsset = withDB(
  async (_event: IpcMainInvokeEvent, db: LowDB, portfolioSlug: string, tickerSymbol: string) => {
    const portfolio = await getPortfolioFromDB(db, portfolioSlug);

    if (!portfolio) {
      // TODO: change this to account for non-existent portfolio
      return null;
    }

    if (!portfolio.assets.some((asset) => asset.symbol === tickerSymbol)) {
      console.error("no asset to remove");
      return null;
    }

    portfolio.assets = portfolio.assets.filter((asset) => asset.symbol !== tickerSymbol);

    return await updatePortfolioAssetData(_event, db, portfolio);
  }
);
