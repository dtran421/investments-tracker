import { IpcMainInvokeEvent } from "electron";
import _ from "lodash";
import { Asset, Portfolio } from "../../renderer/types/db";
import { DbWrapper, withDB } from "./db";
import { StockPriceMap, fetchStockInfo, fetchStockQuotes } from "../api/stocks";
import { AssetData, PortfolioData } from "renderer/types/frontend";

const calculateAllocation = (assetQuantity: number, assetPrice: number, totalPortfolioValue: number) =>
  ((assetQuantity * assetPrice) / totalPortfolioValue) * 100;

const getAssetsData = (assets: Asset[], stockPrices: StockPriceMap): AssetData[] => {
  const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.quantity * stockPrices[asset.symbol], 0);

  return assets.map((asset) => {
    if (asset.symbol === "Cash") {
      return {
        ...asset,
        price: 1,
        marketValue: asset.quantity * asset.costBasis,
        dollarGain: 0,
        percentGain: 0,
        allocation: calculateAllocation(asset.quantity, asset.costBasis, totalPortfolioValue),
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
      allocation: calculateAllocation(asset.quantity, price, totalPortfolioValue),
    };
  });
};

export const fetchPortfolioAssetData = async (
  _event: IpcMainInvokeEvent,
  db: DbWrapper,
  portfolio: Portfolio
): Promise<PortfolioData> => {
  const { assets } = portfolio;
  if (!assets.length) {
    return portfolio as PortfolioData;
  }

  try {
    const tickerSymbols = assets.map((asset) => asset.symbol);
    const stockPrices = await fetchStockQuotes(_event, tickerSymbols);

    if (!Object.keys(stockPrices).length) {
      throw new Error("no stock prices found");
    }

    const portfolioWithRecentAssetData = {
      ...portfolio,
      assets: getAssetsData(assets, stockPrices),
    };

    await db.updatePortfolio(portfolioWithRecentAssetData);

    return portfolioWithRecentAssetData;
  } catch (err) {
    console.error(`something went wrong with fetching stock quotes: ${err}`);
    return {
      ...portfolio,
      assets: assets.map((asset) => ({
        ...asset,
        price: 0,
        marketValue: 0,
        dollarGain: 0,
        percentGain: 0,
        allocation: 0,
      })),
    };
  }
};

export const updateStockAsset = withDB(
  async (
    _event: IpcMainInvokeEvent,
    db: DbWrapper,
    portfolioSlug: string,
    tickerSymbol: string,
    // * can only be undefined if adding new asset
    asset?: Asset
  ): Promise<PortfolioData> => {
    const portfolio = await db.getPortfolio(portfolioSlug);

    if (!portfolio) {
      throw new Error("portfolio not found");
    }

    if (!asset) {
      const stockQuote = await fetchStockInfo(tickerSymbol);

      if (!stockQuote) {
        console.error("couldn't add new asset");
        return {
          ...portfolio,
          assets: portfolio.assets.map((asset) => ({
            ...asset,
            price: 0,
            marketValue: 0,
            dollarGain: 0,
            percentGain: 0,
            allocation: 0,
          })),
        };
      }

      portfolio.assets.unshift(stockQuote);

      return await fetchPortfolioAssetData(_event, db, portfolio);
    }

    const index = portfolio.assets.findIndex((asset) => asset.symbol === tickerSymbol);
    portfolio.assets[index] = asset;

    return await fetchPortfolioAssetData(_event, db, portfolio);
  }
);

export const deleteStockAsset = withDB(
  async (
    _event: IpcMainInvokeEvent,
    db: DbWrapper,
    portfolioSlug: string,
    tickerSymbol: string
  ): Promise<PortfolioData> => {
    const portfolio = await db.getPortfolio(portfolioSlug);

    if (!portfolio) {
      throw new Error("portfolio not found");
    }

    const { assets } = portfolio;
    if (!assets.some((asset) => asset.symbol === tickerSymbol)) {
      console.error("no asset to remove");
      return {
        ...portfolio,
        assets: assets.map((asset) => ({
          ...asset,
          price: 0,
          marketValue: 0,
          dollarGain: 0,
          percentGain: 0,
          allocation: 0,
        })),
      };
    }

    await db.updatePortfolio({
      ...portfolio,
      assets: assets.filter((asset) => asset.symbol !== tickerSymbol),
    });

    return await fetchPortfolioAssetData(_event, db, portfolio);
  }
);
