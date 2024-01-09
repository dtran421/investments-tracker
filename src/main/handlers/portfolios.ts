import { IpcMainInvokeEvent } from "electron";
import _ from "lodash";

import { fetchPortfolioAssetData } from "./stocks";
import { DbWrapper, withDB } from "./db";

export const initializePortfolio = withDB(async (_event: IpcMainInvokeEvent, db: DbWrapper, portfolioName: string) => {
  const portfolioSlug = await db.addPortfolio(portfolioName);

  console.info("portfolio initialized successfully");

  return portfolioSlug;
});

export const fetchPortfolios = withDB(async (_event: IpcMainInvokeEvent, db: DbWrapper) => {
  const portfolios = await db.getPortfolios();
  return Object.values(portfolios).map((portfolio) => _.omit(portfolio, "assets"));
});

export const fetchPortfolio = withDB(async (_event: IpcMainInvokeEvent, db: DbWrapper, portfolioSlug: string) => {
  const portfolio = await db.getPortfolio(portfolioSlug);

  if (!portfolio) {
    // TODO: change this to account for non-existent portfolio
    console.error("portfolio not found");
    return null;
  }

  return await fetchPortfolioAssetData(_event, db, portfolio);
});
