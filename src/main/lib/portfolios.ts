import { join } from "path";
import { app, IpcMainInvokeEvent } from "electron";
import { Low, JSONFile } from "lowdb";
import _ from "lodash";

import { DBSchema } from "../../../types";
import { fetchStockInfo, fetchStockQuotes } from "./stocks";

const PORTFOLIOS_DB_FILENAME = "portfolios.json";

export const initializePortfolio = async (
    _event: IpcMainInvokeEvent,
    portfolioName: string
) => {
    const userDataPath = app.getPath("userData");

    // Use JSON file for storage
    const file = join(userDataPath, PORTFOLIOS_DB_FILENAME);
    const adapter = new JSONFile<DBSchema>(file);
    const db = new Low(adapter);

    // Read data from JSON file, this will set db.data content
    await db.read();

    // If file.json doesn't exist, db.data will be null
    // Set default data
    db.data ||= { portfolios: [] };

    // Create and query items using plain JS
    const portfolioSlug = _.kebabCase(portfolioName);
    const { portfolios } = db.data;
    if (!_.find(portfolios, ["slug", portfolioSlug])) {
        portfolios.push({
            slug: portfolioSlug,
            name: portfolioName,
            order: portfolios.length + 1,
            assets: [
                {
                    symbol: "Cash",
                    description: "Cash and Cash Investments",
                    quantity: 0,
                    costBasis: 1
                }
            ]
        });

        // write db.data content to file
        await db.write();

        console.info("portfolio initialized successfully");

        return portfolioSlug;
    }

    console.info("portfolio already initialized");
    // TODO: change this to account for already initialized portfolio
    return portfolioSlug;
};

export const fetchPortfolios = async () => {
    const userDataPath = app.getPath("userData");

    const file = join(userDataPath, PORTFOLIOS_DB_FILENAME);
    const adapter = new JSONFile<DBSchema>(file);
    const db = new Low(adapter);

    await db.read();

    db.data ||= { portfolios: [] };
    const { portfolios } = db.data;

    return _.map(portfolios, (portfolio) => _.omit(portfolio, "assets"));
};

export const fetchPortfolio = async (
    _event: IpcMainInvokeEvent,
    portfolioSlug: string
) => {
    const userDataPath = app.getPath("userData");

    const file = join(userDataPath, PORTFOLIOS_DB_FILENAME);
    const adapter = new JSONFile<DBSchema>(file);
    const db = new Low(adapter);

    await db.read();

    db.data ||= { portfolios: [] };
    const { portfolios } = db.data;

    const portfolio = _.find(portfolios, ["slug", portfolioSlug]);

    if (portfolio) {
        await fetchStockQuotes(portfolio);
    }

    return portfolio;
};

export const updateStockAsset = async (
    _event: IpcMainInvokeEvent,
    args: [string, string, { field: string; value: string | number } | null]
) => {
    const userDataPath = app.getPath("userData");

    const file = join(userDataPath, PORTFOLIOS_DB_FILENAME);
    const adapter = new JSONFile<DBSchema>(file);
    const db = new Low(adapter);

    await db.read();

    db.data ||= { portfolios: [] };
    const { portfolios } = db.data;

    const [portfolioSlug, stockTicker, updateField] = args;

    const portfolio = _.find(portfolios, ["slug", portfolioSlug]);

    if (portfolio) {
        const { assets } = portfolio;

        if (!updateField) {
            const stockQuote = await fetchStockInfo(stockTicker);

            if (stockQuote) {
                portfolio.assets = [stockQuote, ...assets];

                await db.write();
            } else {
                throw new Error("couldn't add new asset");
            }
        } else {
            const { field, value } = updateField;

            const index = _.findIndex(assets, ["symbol", stockTicker]);
            portfolio.assets[index] = _.set(
                portfolio.assets[index],
                field,
                value
            );

            await db.write();
        }

        await fetchStockQuotes(portfolio);
    }

    return portfolio;
};

export const deleteStockAsset = async (
    _event: IpcMainInvokeEvent,
    portfolioSlug: string,
    stockTicker: string
) => {
    const userDataPath = app.getPath("userData");

    const file = join(userDataPath, PORTFOLIOS_DB_FILENAME);
    const adapter = new JSONFile<DBSchema>(file);
    const db = new Low(adapter);

    await db.read();

    db.data ||= { portfolios: [] };
    const { portfolios } = db.data;

    const portfolio = _.find(portfolios, ["slug", portfolioSlug]);

    if (portfolio) {
        const { assets } = portfolio;

        if (_.some(assets, ["symbol", stockTicker])) {
            portfolio.assets = _.reject(assets, ["symbol", stockTicker]);

            await db.write();
        } else {
            throw new Error("no asset to remove");
        }

        await fetchStockQuotes(portfolio);
    }

    return portfolio;
};
