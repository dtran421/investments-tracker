import { contextBridge, ipcRenderer } from "electron";

import { Channels, Transaction } from "../../types";

contextBridge.exposeInMainWorld("electronAPI", {
    createPortfolio: (portfolioName: string) =>
        ipcRenderer.invoke(Channels.INITIALIZE_PORTFOLIO, portfolioName),
    getPortfolios: () => ipcRenderer.invoke(Channels.FETCH_PORTFOLIOS),
    getPortfolio: (portfolioSlug: string) =>
        ipcRenderer.invoke(Channels.FETCH_PORTFOLIO, portfolioSlug),
    getStockQuote: (tickerSymbol: string) =>
        ipcRenderer.invoke(Channels.FETCH_STOCK_QUOTE, [tickerSymbol]),
    updateStock: (
        portfolioSlug: string,
        tickerSymbol: string,
        updateField: { field: string; value: string | number } | null
    ) =>
        ipcRenderer.invoke(
            Channels.UPDATE_STOCK_ASSET,
            portfolioSlug,
            tickerSymbol,
            updateField
        ),
    deleteStock: (portfolioSlug: string, tickerSymbol: string) =>
        ipcRenderer.invoke(
            Channels.DELETE_STOCK_ASSET,
            portfolioSlug,
            tickerSymbol
        ),
    updateTxn: (portfolioSlug: string, txn: Transaction) =>
        ipcRenderer.invoke(Channels.UPDATE_TXN, portfolioSlug, txn),
    deleteTxn: (
        portfolioSlug: string,
        tickerSymbol: string,
        updateAsset: boolean
    ) =>
        ipcRenderer.invoke(
            Channels.DELETE_TXN,
            portfolioSlug,
            tickerSymbol,
            updateAsset
        )
});
