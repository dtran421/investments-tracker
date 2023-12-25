/**
 * Database types
 */

import { Low } from "lowdb";

export enum TransactionMode {
  "BUY",
  "SELL",
}

export interface Transaction {
  transactionMode: TransactionMode;
  tickerSymbol: string;
  targetAllocation: number;
  shares: number;
  costBasis: number;
}

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
  transactionQueue: Transaction[];
}

export interface DBSchema {
  portfolios: Portfolio[];
}

export type LowDB = Low<DBSchema>;
