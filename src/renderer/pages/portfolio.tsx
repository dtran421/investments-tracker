import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import TabLayout from "renderer/components/layout/TabLayout";
import Table from "renderer/components/portfolio/Table";

import { PortfolioData } from "../../../types";
import Contexts from "../../../Contexts";

const Portfolio = () => {
    const { portfolioSlug } = useParams();

    const { PortfolioContext } = Contexts;

    const [portfolio, setPortfolio] = useState<PortfolioData>({
        slug: "",
        name: "",
        order: 0,
        assets: []
    });
    useEffect(() => {
        const fetchPortfolio = async () => {
            if (portfolioSlug) {
                const portfolioData = await window.electronAPI.getPortfolio(
                    portfolioSlug
                );

                setPortfolio(portfolioData);
            } else {
                console.error("error: no portfolio found!");
            }
        };

        fetchPortfolio();
    }, [portfolioSlug]);

    const { slug, name, assets } = portfolio as PortfolioData;

    const updateAsset = useCallback(
        async (
            ev: FormEvent,
            stockTicker: string,
            updateField: { field: string; value: string | number } | null
        ) => {
            ev.preventDefault();

            const portfolioData = await window.electronAPI.updateStock(
                slug,
                stockTicker,
                updateField
            );

            setPortfolio(portfolioData);
        },
        [slug]
    );

    const portfolioContext = useMemo(
        () => ({
            updateAsset
        }),
        [updateAsset]
    );

    if (!portfolio) {
        return null;
    }
    return (
        <TabLayout activePage={slug}>
            <div className="space-y-6 px-8 py-4">
                <p className="text-4xl font-semibold">{name}</p>
                <PortfolioContext.Provider value={portfolioContext}>
                    <Table assetData={assets} {...{ updateAsset }} />
                </PortfolioContext.Provider>
            </div>
        </TabLayout>
    );
};

export default Portfolio;
