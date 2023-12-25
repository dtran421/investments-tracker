import { Portfolio, Transaction } from "./types/db";
import { PortfolioData } from "./types/types";

declare global {
  interface Window {
    electronAPI: {
      // onCreateReturn: (func: (str: string) => void) => () => IpcRenderer;
      // once(channel: string, func: (...args: unknown[]) => void): void;

      // portfolios
      createPortfolio: (portfolioName: string) => void;
      getPortfolios: () => Promise<Portfolio[]>;
      getPortfolio: (portfolioSlug: string) => Promise<PortfolioData>;

      // stocks
      getStockQuote: (tickerSymbol: string) => Promise<Record<string, number>>;
      updateStock: (
        portfolioSlug: string,
        tickerSymbol: string,
        updateField: { field: string; value: string | number } | null
      ) => Promise<PortfolioData>;
      deleteStock: (portfolioSlug: string, tickerSymbol: string) => Promise<PortfolioData>;

      // transactions
      updateTxn: (portfolioSlug: string, txn: Transaction) => Promise<Transaction[]>;
      deleteTxn: (portfolioSlug: string, tickerSymbol: string, updateAsset: boolean) => Promise<Transaction[]>;
    };
  }
}

export {};
