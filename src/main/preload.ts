import { Transaction, contextBridge, ipcRenderer } from "electron";
import { Channel } from "../renderer/types/api";

contextBridge.exposeInMainWorld("electronAPI", {
  // portfolios
  createPortfolio: (portfolioName: string) => ipcRenderer.invoke(Channel.INITIALIZE_PORTFOLIO, portfolioName),
  getPortfolios: () => ipcRenderer.invoke(Channel.FETCH_PORTFOLIOS),
  getPortfolio: (portfolioSlug: string) => ipcRenderer.invoke(Channel.FETCH_PORTFOLIO, portfolioSlug),
  getStockQuote: (tickerSymbol: string) => ipcRenderer.invoke(Channel.FETCH_STOCK_QUOTE, [tickerSymbol]),

  // stocks
  updateStock: (
    portfolioSlug: string,
    tickerSymbol: string,
    updateField: { field: string; value: string | number } | null
  ) => ipcRenderer.invoke(Channel.UPDATE_STOCK_ASSET, portfolioSlug, tickerSymbol, updateField),
  deleteStock: (portfolioSlug: string, tickerSymbol: string) =>
    ipcRenderer.invoke(Channel.DELETE_STOCK_ASSET, portfolioSlug, tickerSymbol),

  // transactions
  updateTxn: (portfolioSlug: string, txn: Transaction) =>
    ipcRenderer.invoke(Channel.UPDATE_TRANSACTION, portfolioSlug, txn),
  deleteTxn: (portfolioSlug: string, tickerSymbol: string, updateAsset: boolean) =>
    ipcRenderer.invoke(Channel.DELETE_TRANSACTION, portfolioSlug, tickerSymbol, updateAsset),
});
