import { join } from "path";
import { app, IpcMainEvent } from "electron";
import { Low, JSONFile } from "lowdb";
import _ from "lodash";

import { Channels, DBSchema } from "../../../types";

const initializePortfolio = async (event: IpcMainEvent, args: string[]) => {
    try {
        const userDataPath = app.getPath("userData");

        // Use JSON file for storage
        const file = join(userDataPath, "portfolios.json");
        const adapter = new JSONFile<DBSchema>(file);
        const db = new Low(adapter);

        // Read data from JSON file, this will set db.data content
        await db.read();

        // If file.json doesn't exist, db.data will be null
        // Set default data
        db.data ||= { portfolios: [] };

        // Create and query items using plain JS
        const portfolioName = args[0];
        const { portfolios } = db.data;
        if (!_.find(portfolios, ["name", portfolioName])) {
            portfolios.push({
                name: portfolioName,
                order: portfolios.length + 1
            });
        }

        // write db.data content to file
        await db.write();

        event.reply(
            "initialize-portfolio",
            "portfolio initialized successfully"
        );
    } catch (err) {
        event.reply(
            Channels.INITIALIZE_PORTFOLIO,
            "error with portfolio initialization"
        );
    }
};

export default initializePortfolio;
