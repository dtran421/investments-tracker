import { useMemo } from "react";

import Table from "renderer/components/portfolio/Table";

import Contexts from "../../../Contexts";
import { AssetData } from "../../../types";

interface HoldingsProps {
    assets: AssetData[];
    updateAsset: (
        stockTicker: string,
        updateField: { field: string; value: string | number } | null
    ) => Promise<void>;
    deleteAsset: (stockTicker: string) => Promise<void>;
}

const Holdings = ({ assets, updateAsset, deleteAsset }: HoldingsProps) => {
    const { PortfolioContext } = Contexts;

    const portfolioContext = useMemo(
        () => ({
            updateAsset,
            deleteAsset
        }),
        [updateAsset, deleteAsset]
    );
    return (
        <PortfolioContext.Provider value={portfolioContext}>
            {assets.length && <Table assetData={assets} {...{ updateAsset }} />}
        </PortfolioContext.Provider>
    );
};

export default Holdings;
