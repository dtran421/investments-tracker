import { IpcMainInvokeEvent } from "electron";
import _ from "lodash";

import { updatePortfolioAssetData } from "./stocks";
import { Asset, LowDB } from "../../renderer/types/db";
import { getPortfoliosFromDB, getPortfolioFromDB, withDB } from "./db";

export const CASH_SYMBOL = "Cash";

const CashAsset: Asset = {
  symbol: CASH_SYMBOL,
  description: "Cash and Cash Investments",
  quantity: 0,
  costBasis: 1,
} as const;

export const initializePortfolio = withDB(async (_event: IpcMainInvokeEvent, db: LowDB, portfolioName: string) => {
  const portfolios = await getPortfoliosFromDB(db);

  const portfolioSlug = _.kebabCase(portfolioName);

  if (portfolios.find((portfolio) => portfolio.slug === portfolioSlug)) {
    console.info("portfolio already initialized");
    // TODO: change this to account for already initialized portfolio
    return portfolioSlug;
  }

  portfolios.push({
    slug: portfolioSlug,
    name: portfolioName,
    order: portfolios.length + 1,
    assets: [CashAsset],
    transactionQueue: [],
  });

  await db.write();

  console.info("portfolio initialized successfully");

  return portfolioSlug;
});

export const fetchPortfolios = withDB(async (_event: IpcMainInvokeEvent, db: LowDB) => {
  const portfolios = await getPortfoliosFromDB(db);
  return portfolios.map((portfolio) => _.omit(portfolio, "assets"));
});

export const fetchPortfolio = withDB(async (_event: IpcMainInvokeEvent, db: LowDB, portfolioSlug: string) => {
  const portfolio = await getPortfolioFromDB(db, portfolioSlug);

  if (!portfolio) {
    // TODO: change this to account for non-existent portfolio
    throw new Error("portfolio not found");
  }

  return await updatePortfolioAssetData(_event, db, portfolio);
});
