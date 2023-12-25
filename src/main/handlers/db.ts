import path from "path";
import { IpcMainInvokeEvent, app } from "electron";
import { JSONFile, Low } from "lowdb";
import { DBSchema, LowDB } from "../../renderer/types/db";
import { IpcMainInvokeFn } from "../../renderer/types/api";

const PORTFOLIOS_DB_FILENAME = "portfolios.json";

export const getDB = async () => {
  const userDataPath = app.getPath("userData");

  const file = path.join(userDataPath, PORTFOLIOS_DB_FILENAME);
  const adapter = new JSONFile<DBSchema>(file);
  const db = new Low(adapter);

  await db.read();

  return db;
};

export const withDB =
  (func: IpcMainInvokeFn) =>
  async (event: IpcMainInvokeEvent, ...args: unknown[]) =>
    func(event, await getDB(), ...args);

export const getPortfoliosFromDB = async (db: LowDB) => {
  await db.read();
  db.data ||= { portfolios: [] };

  return db.data.portfolios;
};

export const getPortfolioFromDB = async (db: LowDB, portfolioSlug: string) => {
  const portfolios = await getPortfoliosFromDB(db);
  return portfolios.find((portfolio) => portfolio.slug === portfolioSlug);
};
