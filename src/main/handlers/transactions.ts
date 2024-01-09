import { IpcMainInvokeEvent } from "electron";
import { Transaction, TransactionMode } from "../../renderer/types/db";
import { DbWrapper, withDB } from "./db";
import { fetchStockInfo, fetchStockQuote } from "../api/stocks";

export const updateTransaction = withDB(
  async (_event: IpcMainInvokeEvent, db: DbWrapper, portfolioSlug: string, transaction: Transaction) => {
    const portfolio = await db.getPortfolio(portfolioSlug);

    if (!portfolio) {
      // TODO: change this to account for non-existent portfolio
      return [];
    }

    const { transactionQueue } = portfolio;

    const index = transactionQueue.findIndex((txn) => txn.tickerSymbol === transaction.tickerSymbol);
    if (index === -1) {
      transactionQueue.push(transaction);
    } else {
      transactionQueue[index] = transaction;
    }

    await db.updatePortfolio(portfolio);

    return transactionQueue;
  }
);

export const deleteTransaction = withDB(
  async (
    _event: IpcMainInvokeEvent,
    db: DbWrapper,
    portfolioSlug: string,
    tickerSymbol: string,
    updateAsset: boolean
  ) => {
    const portfolio = await db.getPortfolio(portfolioSlug);

    if (!portfolio) {
      // TODO: change this to account for non-existent portfolio
      return [];
    }

    const transaction = portfolio.transactionQueue.find((txn) => txn.tickerSymbol === tickerSymbol);
    if (!transaction) {
      console.error("no transaction to remove");
      return portfolio.transactionQueue;
    }

    if (!updateAsset) {
      portfolio.transactionQueue = portfolio.transactionQueue.filter((txn) => txn.tickerSymbol !== tickerSymbol);
      await db.updatePortfolio(portfolio);
      return portfolio.transactionQueue;
    }

    const stockInfo = await fetchStockInfo(tickerSymbol);
    const stockPrice = await fetchStockQuote(_event, tickerSymbol);

    if (!stockInfo || stockPrice === undefined) {
      console.error("couldn't fetch stock info");
      return portfolio.transactionQueue;
    }

    const cashIndex = portfolio.assets.findIndex((asset) => asset.symbol === DbWrapper.CASH_SYMBOL);

    if (cashIndex === -1) {
      // TODO: change this to account for non-existent cash asset
      console.error("no cash asset found");
      return portfolio.transactionQueue;
    }

    const assetIndex = portfolio.assets.findIndex((asset) => asset.symbol === tickerSymbol);

    const adjustmentMultiplier = transaction.transactionMode === TransactionMode.BUY ? 1 : -1;

    portfolio.assets[cashIndex].quantity += adjustmentMultiplier * Number((transaction.shares * stockPrice).toFixed(6));

    const newAsset = {
      ...stockInfo,
      quantity: transaction.shares,
      costBasis: stockPrice,
    };

    if (assetIndex !== -1) {
      const asset = portfolio.assets[assetIndex];

      newAsset.quantity = asset.quantity + transaction.shares;
      newAsset.costBasis =
        (asset.quantity * asset.costBasis + adjustmentMultiplier * transaction.shares * stockPrice) / newAsset.quantity;

      portfolio.assets = portfolio.assets.filter((asset) => asset.symbol !== tickerSymbol);
    }

    portfolio.assets.unshift(newAsset);

    await db.updatePortfolio(portfolio);

    return portfolio.transactionQueue;
  }
);
