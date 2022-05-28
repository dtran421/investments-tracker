import { createContext } from "react";

const PortfolioContext = createContext<{
    updateAsset: (
        stockTicker: string,
        updateField: { field: string; value: string | number } | null
    ) => void;
    deleteAsset: (stockTicker: string) => void;
}>({
    updateAsset: () => new Promise(() => {}),
    deleteAsset: () => new Promise(() => {})
});

export default {
    PortfolioContext
};
