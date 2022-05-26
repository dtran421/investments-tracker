import { createContext, FormEvent } from "react";

const PortfolioContext = createContext<{
    updateAsset: (
        ev: FormEvent,
        stockTicker: string,
        updateField: { field: string; value: string | number } | null
    ) => void;
}>({
    updateAsset: () => new Promise(() => {})
});

export default {
    PortfolioContext
};
