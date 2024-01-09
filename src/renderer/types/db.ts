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
  assets: Asset[];
  transactionQueue: Transaction[];
}

export interface DbPortfolio extends Portfolio {
  order: number;
}

export type Portfolios = {
  [slug: string]: DbPortfolio;
};

export interface DBSchema {
  portfolios: Portfolios;
}

export type LowDB = Low<DBSchema>;
