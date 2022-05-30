import { join } from "path";
import { app, IpcMainInvokeEvent } from "electron";
import { Low, JSONFile } from "lowdb";
import _ from "lodash";

import { DBSchema, Asset, Transaction } from "../../../types";
import { fetchStockInfo, fetchStockQuotes, getAssetData } from "./stocks";

const PORTFOLIOS_DB_FILENAME = "portfolios.json";

export const initializePortfolio = async (
    _event: IpcMainInvokeEvent,
    portfolioName: string
) => {
    const userDataPath = app.getPath("userData");

    const file = join(userDataPath, PORTFOLIOS_DB_FILENAME);
    const adapter = new JSONFile<DBSchema>(file);
    const db = new Low(adapter);

    await db.read();

    db.data ||= { portfolios: [] };

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
            ],
            txnQueue: []
        });

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
        await getAssetData(_event, portfolio);
    }

    return portfolio;
};

export const updateStockAsset = async (
    _event: IpcMainInvokeEvent,
    portfolioSlug: string,
    tickerSymbol: string,
    updateField: { field: string; value: string | number } | null
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

        if (!updateField) {
            const stockQuote = await fetchStockInfo(tickerSymbol);

            if (stockQuote) {
                portfolio.assets = [stockQuote, ...assets];
            } else {
                throw new Error("couldn't add new asset");
            }
        } else {
            const { field, value } = updateField;

            const index = _.findIndex(assets, ["symbol", tickerSymbol]);
            portfolio.assets[index] = _.set(
                portfolio.assets[index],
                field,
                value
            );
        }
        await db.write();

        await getAssetData(_event, portfolio);
    }

    return portfolio;
};

export const deleteStockAsset = async (
    _event: IpcMainInvokeEvent,
    portfolioSlug: string,
    tickerSymbol: string
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

        if (_.some(assets, ["symbol", tickerSymbol])) {
            portfolio.assets = _.reject(assets, ["symbol", tickerSymbol]);

            await db.write();
        } else {
            throw new Error("no asset to remove");
        }

        await getAssetData(_event, portfolio);
    }

    return portfolio;
};

export const updateTxn = async (
    _event: IpcMainInvokeEvent,
    portfolioSlug: string,
    txn: Transaction
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
        const { txnQueue } = portfolio;

        const index = _.findIndex(txnQueue, ["symbol", txn.symbol]);
        if (index === -1) {
            portfolio.txnQueue = [...txnQueue, txn];
        } else {
            portfolio.txnQueue[index] = txn;
        }

        await db.write();

        return portfolio.txnQueue;
    }

    return [];
};

export const deleteTxn = async (
    _event: IpcMainInvokeEvent,
    portfolioSlug: string,
    tickerSymbol: string,
    updateAsset: boolean
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
        const { assets, txnQueue } = portfolio;

        const txn = _.find(txnQueue, ["symbol", tickerSymbol]);
        if (txn) {
            portfolio.txnQueue = _.reject(txnQueue, ["symbol", tickerSymbol]);

            if (updateAsset) {
                const { mode, shares } = txn;

                const stockQuote = await fetchStockInfo(tickerSymbol);
                const { [tickerSymbol]: price } = await fetchStockQuotes(
                    _event,
                    [tickerSymbol]
                );

                if (stockQuote) {
                    const cash = _.find(assets, ["symbol", "Cash"]) as Asset;
                    const asset = _.find(assets, ["symbol", tickerSymbol]);

                    let modifiedStockQuote;
                    if (asset) {
                        const {
                            quantity: currShares,
                            costBasis: currCostBasis
                        } = asset;

                        const newQuantity = currShares + shares;
                        const newCostBasis =
                            (currShares * currCostBasis +
                                (mode === "buy" ? 1 : -1) * shares * price) /
                            newQuantity;

                        modifiedStockQuote = {
                            ...stockQuote,
                            quantity: newQuantity,
                            costBasis: newCostBasis
                        };
                    } else {
                        modifiedStockQuote = {
                            ...stockQuote,
                            quantity: shares,
                            costBasis: price
                        };
                    }

                    cash.quantity +=
                        (mode === "buy" ? -1 : 1) *
                        Number((shares * price).toFixed(6));

                    portfolio.assets = [
                        modifiedStockQuote,
                        ..._.filter(
                            assets,
                            ({ symbol }) =>
                                symbol !== tickerSymbol && symbol !== "Cash"
                        ),
                        cash
                    ];
                } else {
                    throw new Error("couldn't add new asset");
                }
            }

            await db.write();
        } else {
            throw new Error("no asset to remove");
        }

        return portfolio.txnQueue;
    }

    return [];
};
