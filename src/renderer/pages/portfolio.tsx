import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import TabLayout from "../components/layouts/TabLayout";

import { PortfolioData } from "../../../types";
import Calculator from "./calculator";
import Composition from "./composition";
import Holdings from "./holdings";

const stockTabs = ["Holdings", "Composition", "Calculator"];

const Portfolio = () => {
    const { portfolioSlug } = useParams();

    const [openTabs, setOpenTabs] = useState(stockTabs);
    const [activeTab, setActiveTab] = useState(stockTabs[0]);

    useEffect(() => {
        setActiveTab(openTabs[openTabs.length - 1]);
    }, [openTabs]);

    const [portfolio, setPortfolio] = useState<PortfolioData>({
        slug: "",
        name: "",
        order: 0,
        assets: [],
        txnQueue: []
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
    }, [portfolioSlug, activeTab]);

    const { slug, name, assets, txnQueue } = portfolio;

    const updateAsset = useCallback(
        async (
            tickerSymbol: string,
            updateField: { field: string; value: string | number } | null
        ) => {
            const portfolioData = await window.electronAPI.updateStock(
                slug,
                tickerSymbol,
                updateField
            );

            setPortfolio(portfolioData);
        },
        [slug]
    );

    const deleteAsset = useCallback(
        async (tickerSymbol: string) => {
            const portfolioData = await window.electronAPI.deleteStock(
                slug,
                tickerSymbol
            );

            setPortfolio(portfolioData);
        },
        [slug]
    );

    let tabPage;
    switch (activeTab) {
        case "Holdings":
            tabPage = (
                <Holdings
                    {...{
                        assets,
                        updateAsset,
                        deleteAsset
                    }}
                />
            );
            break;
        case "Composition":
            tabPage = <Composition {...{ assets }} />;
            break;
        case "Calculator":
            tabPage = (
                <Calculator portfolioSlug={slug} {...{ assets, txnQueue }} />
            );
            break;
        default:
            tabPage = null;
    }
    return portfolio ? (
        <TabLayout
            activePage={slug}
            tabs={stockTabs}
            {...{
                activeTab,
                setActiveTab,
                openTabs,
                setOpenTabs
            }}
        >
            <div className="space-y-6 p-8">
                <div className="flex space-x-6">
                    <p className="text-4xl font-semibold">{name}</p>
                    <div className="flex items-center text-emerald-500 bg-emerald-800/60 rounded-lg px-4 py-1">
                        <p>Stocks</p>
                    </div>
                </div>
                <div className="overflow-y-auto">{tabPage}</div>
            </div>
        </TabLayout>
    ) : null;
};

export default Portfolio;
