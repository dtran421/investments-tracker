import { Portfolio, PortfolioData, Transaction } from "../../types";

declare global {
    interface Window {
        electronAPI: {
            createPortfolio: (portfolioName: string) => void;
            // onCreateReturn: (func: (str: string) => void) => () => IpcRenderer;
            // once(channel: string, func: (...args: unknown[]) => void): void;
            getPortfolios: () => Promise<Portfolio[]>;
            getPortfolio: (portfolioSlug: string) => Promise<PortfolioData>;
            getStockQuote: (
                tickerSymbol: string
            ) => Promise<Record<string, number>>;
            updateStock: (
                portfolioSlug: string,
                tickerSymbol: string,
                updateField: { field: string; value: string | number } | null
            ) => Promise<PortfolioData>;
            deleteStock: (
                portfolioSlug: string,
                tickerSymbol: string
            ) => Promise<PortfolioData>;
            updateTxn: (
                portfolioSlug: string,
                txn: Transaction
            ) => Promise<Transaction[]>;
            deleteTxn: (
                portfolioSlug: string,
                tickerSymbol: string,
                updateAsset: boolean
            ) => Promise<Transaction[]>;
        };
    }
}

export {};
