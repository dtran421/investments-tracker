import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

import { Channels } from "../../types";

contextBridge.exposeInMainWorld("electronAPI", {
    createPortfolio: (portfolioName: string) =>
        ipcRenderer.send(Channels.INITIALIZE_PORTFOLIO, portfolioName),
    onCreateReturn: (func: (str: string) => void) => {
        const subscription = (_event: IpcRendererEvent, str: string) =>
            func(str);
        ipcRenderer.on(Channels.INITIALIZE_PORTFOLIO, subscription);

        return () =>
            ipcRenderer.removeListener(
                Channels.INITIALIZE_PORTFOLIO,
                subscription
            );
    },
    // once(channel: Channels, func: (...args: unknown[]) => void) {
    //     ipcRenderer.once(channel, (_event, ...args) => func(...args));
    // }
    fetchPortfolios: () => ipcRenderer.invoke(Channels.FETCH_PORTFOLIOS)
});
