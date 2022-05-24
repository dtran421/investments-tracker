import { IpcRenderer } from "electron";

import { Portfolio } from "../../types";

declare global {
    interface Window {
        electronAPI: {
            createPortfolio: (portfolioName: string) => void;
            onCreateReturn: (func: (str: string) => void) => () => IpcRenderer;
            // once(channel: string, func: (...args: unknown[]) => void): void;
            fetchPortfolios: () => Promise<Portfolio[]>;
        };
    }
}

export {};
