import { Portfolio, PortfolioData } from "../../types";

declare global {
    interface Window {
        electronAPI: {
            createPortfolio: (portfolioName: string) => void;
            // onCreateReturn: (func: (str: string) => void) => () => IpcRenderer;
            // once(channel: string, func: (...args: unknown[]) => void): void;
            getPortfolios: () => Promise<Portfolio[]>;
            getPortfolio: (portfolioSlug: string) => Promise<PortfolioData>;
            updateStock: (
                portfolioSlug: string,
                stockTicker: string,
                updateField: { field: string; value: string | number } | null
            ) => Promise<PortfolioData>;
            deleteStock: (
                portfolioSlug: string,
                stockTicker: string
            ) => Promise<PortfolioData>;
        };
    }
}

export {};
