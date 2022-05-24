export enum Channels {
    "IPC_EXAMPLE" = "ipc-example",
    "INITIALIZE_PORTFOLIO" = "initializePortfolio",
    "FETCH_PORTFOLIOS" = "fetchPortfolios"
}

export type Portfolio = {
    slug: string;
    name: string;
    order: number;
};

export type DBSchema = {
    portfolios: Portfolio[];
};
