import { Asset, Portfolio } from "./db";

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
