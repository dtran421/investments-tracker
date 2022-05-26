/**
 * electronAPI types
 */
export enum Channels {
    "INITIALIZE_PORTFOLIO" = "initializePortfolio",
    "FETCH_PORTFOLIOS" = "fetchPortfolios",
    "FETCH_PORTFOLIO" = "fetchPortfolio",
    "UPDATE_STOCK_ASSET" = "updateStockAsset"
}

/**
 * Database types
 */
export interface Asset {
    symbol: string;
    description: string;
    sector?: string;
    quantity: number;
    costBasis: number;
}

export interface Portfolio {
    slug: string;
    name: string;
    order: number;
    assets: Asset[];
}

export interface DBSchema {
    portfolios: Portfolio[];
}

/**
 * Frontend types
 */
export interface AssetData extends Asset {
    price: number;
    marketValue: number;
    dollarGain: number;
    percentGain: number;
    allocation: number;
}

export interface PortfolioData extends Portfolio {
    assets: AssetData[];
}
