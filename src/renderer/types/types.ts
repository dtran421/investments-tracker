import { Asset } from "webpack";
import { Portfolio } from "./db";

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

export interface PortfolioData extends Omit<Portfolio, "assets"> {
  assets: AssetData[];
}
