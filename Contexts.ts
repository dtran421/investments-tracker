import { createContext } from "react";

const PortfolioContext = createContext<{
    updateAsset: (
        tickerSymbol: string,
        updateField: { field: string; value: string | number } | null
    ) => void;
    deleteAsset: (tickerSymbol: string) => void;
}>({
    updateAsset: () => new Promise(() => {}),
    deleteAsset: () => new Promise(() => {})
});

export default {
    PortfolioContext
};
