import { IpcMainInvokeEvent } from "electron";
import { DbWrapper } from "main/handlers/db";

export enum Channel {
  "INITIALIZE_PORTFOLIO" = "initializePortfolio",
  "FETCH_PORTFOLIOS" = "fetchPortfolios",
  "FETCH_PORTFOLIO" = "fetchPortfolio",
  "UPDATE_STOCK_ASSET" = "updateStockAsset",
  "DELETE_STOCK_ASSET" = "deleteStockAsset",
  "FETCH_STOCK_QUOTE" = "fetchStockQuote",
  "UPDATE_TRANSACTION" = "updateTransaction",
  "DELETE_TRANSACTION" = "deleteTransaction",
}

export type IpcMainInvokeFn = (event: IpcMainInvokeEvent, db: DbWrapper, ...args: any[]) => Promise<unknown>;
