import path from "path";
import { IpcMainInvokeEvent, app } from "electron";
import { JSONFile, Low } from "lowdb";
import { Asset, DBSchema, LowDB, Portfolio } from "../../renderer/types/db";
import { IpcMainInvokeFn } from "../../renderer/types/api";
import _ from "lodash";

const PORTFOLIOS_DB_FILENAME = "portfolios.json";

export class DbWrapper {
  static readonly CASH_SYMBOL = "Cash";

  static readonly CashAsset: Asset = {
    symbol: DbWrapper.CASH_SYMBOL,
    description: "Cash and Cash Investments",
    quantity: 0,
    costBasis: 1,
  } as const;

  private db: Low<DBSchema>;

  constructor() {
    const userDataPath = app.getPath("userData");

    const file = path.join(userDataPath, PORTFOLIOS_DB_FILENAME);
    const adapter = new JSONFile<DBSchema>(file);
    const db = new Low(adapter);

    this.db = db;
  }

  async getPortfolios() {
    await this.db.read();

    if (!this.db.data) {
      return {};
    }

    return this.db.data.portfolios;
  }

  async getPortfolio(portfolioSlug: string) {
    await this.db.read();

    if (!this.db.data) {
      return null;
    }

    return _.omit(this.db.data.portfolios[portfolioSlug], "order") || null;
  }

  async addPortfolio(portfolioName: string) {
    const portfolioSlug = _.kebabCase(portfolioName);

    const existingPortfolio = await this.getPortfolio(portfolioSlug);
    if (existingPortfolio) {
      console.info("portfolio already initialized");
      return null;
    }

    this.db.data ||= { portfolios: {} };

    this.db.data.portfolios[portfolioSlug] = {
      name: portfolioName,
      assets: [DbWrapper.CashAsset],
      transactionQueue: [],
      slug: portfolioSlug,
      order: Object.keys(this.db.data.portfolios).length + 1,
    };

    await this.db.write();
    return portfolioSlug;
  }

  async updatePortfolio(portfolio: Portfolio) {
    await this.db.read();

    if (!this.db.data) {
      return;
    }

    this.db.data.portfolios[portfolio.slug] = {
      ...portfolio,
      order: this.db.data.portfolios[portfolio.slug].order,
    };

    await this.db.write();
  }
}

export const withDB =
  (func: IpcMainInvokeFn) =>
  async (event: IpcMainInvokeEvent, ...args: unknown[]) =>
    func(event, new DbWrapper(), ...args);

export const getPortfoliosFromDB = async (db: LowDB) => {
  await db.read();
  db.data ||= { portfolios: {} };

  return db.data.portfolios;
};
