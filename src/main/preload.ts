import { contextBridge, ipcRenderer } from "electron";

import { Channels } from "../../types";

contextBridge.exposeInMainWorld("electronAPI", {
    createPortfolio: (portfolioName: string) =>
        ipcRenderer.invoke(Channels.INITIALIZE_PORTFOLIO, portfolioName),
    // onCreateReturn: (func: (str: string) => void) => {
    //     const subscription = (_event: IpcRendererEvent, str: string) =>
    //         func(str);
    //     ipcRenderer.on(Channels.INITIALIZE_PORTFOLIO, subscription);

    //     return () =>
    //         ipcRenderer.removeListener(
    //             Channels.INITIALIZE_PORTFOLIO,
    //             subscription
    //         );
    // },
    // once(channel: Channels, func: (...args: unknown[]) => void) {
    //     ipcRenderer.once(channel, (_event, ...args) => func(...args));
    // }
    getPortfolios: () => ipcRenderer.invoke(Channels.FETCH_PORTFOLIOS),
    getPortfolio: (portfolioSlug: string) =>
        ipcRenderer.invoke(Channels.FETCH_PORTFOLIO, portfolioSlug),
    updateStock: (
        portfolioSlug: string,
        stockTicker: string,
        updateField: { field: string; value: string | number } | null
    ) =>
        ipcRenderer.invoke(Channels.UPDATE_STOCK_ASSET, [
            portfolioSlug,
            stockTicker,
            updateField
        ])
});
