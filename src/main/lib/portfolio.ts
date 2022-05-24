import { join } from "path";
import { app, IpcMainEvent } from "electron";
import { Low, JSONFile } from "lowdb";
import _ from "lodash";

import { Channels, DBSchema } from "../../../types";

const PORTFOLIOS_DB_FILENAME = "portfolios.json";

export const initializePortfolio = async (
    event: IpcMainEvent,
    portfolioName: string
) => {
    try {
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
                order: portfolios.length + 1
            });

            // write db.data content to file
            await db.write();

            event.reply(
                Channels.INITIALIZE_PORTFOLIO,
                "portfolio initialized successfully"
            );
        } else {
            event.reply(
                Channels.INITIALIZE_PORTFOLIO,
                "portfolio already initialized!"
            );
        }
    } catch (err) {
        event.reply(
            Channels.INITIALIZE_PORTFOLIO,
            "error with portfolio initialization"
        );
    }
};

export const fetchPortfolios = async () => {
    try {
        const userDataPath = app.getPath("userData");

        const file = join(userDataPath, PORTFOLIOS_DB_FILENAME);
        const adapter = new JSONFile<DBSchema>(file);
        const db = new Low(adapter);

        await db.read();

        db.data ||= { portfolios: [] };

        const { portfolios } = db.data;
        return portfolios;
    } catch (err) {
        console.error(`something went wrong with fetching portfolios: ${err}`);
        return [];
    }
};
