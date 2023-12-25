import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import _ from "lodash";

import TabLayout from "../components/layouts/TabLayout";
import Calculator from "./calculator";
import Composition from "./composition";
import Holdings from "./holdings";

import { PortfolioData } from "../types/types";

const stockTabs = ["Holdings", "Composition", "Calculator"];

const Portfolio = () => {
  const navigate = useNavigate();
  const { portfolioSlug } = useParams();

  const [[openTabs, changeStatus], setOpenTabs] = useState<[string[], "initial" | "open" | "close" | ""]>([
    stockTabs,
    "initial",
  ]);
  const [[activeTab, activeIdx], setActiveTab] = useState(["", -1]);

  useEffect(() => {
    switch (changeStatus) {
      case "initial":
        setActiveTab([openTabs[0], 0]);
        break;
      case "open":
        setActiveTab([openTabs[openTabs.length - 1], openTabs.length - 1]);
        break;
      case "close":
        if (!_.includes(openTabs, activeTab)) {
          if (openTabs.length === 0) {
            navigate(`/`);
          } else if (activeIdx < openTabs.length) {
            setActiveTab([openTabs[activeIdx], activeIdx]);
          } else {
            setActiveTab([openTabs[activeIdx - 1], activeIdx]);
          }
        }
        break;
      default:
        break;
    }
    setOpenTabs([openTabs, ""]);
  }, [activeIdx, activeTab, changeStatus, navigate, openTabs]);

  const [portfolio, setPortfolio] = useState<PortfolioData>({
    slug: "",
    name: "",
    order: 0,
    assets: [],
    txnQueue: [],
  });
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (portfolioSlug) {
        const portfolioData = await window.electronAPI.getPortfolio(portfolioSlug);

        setPortfolio(portfolioData);
      } else {
        console.error("error: no portfolio found!");
      }
    };

    fetchPortfolio();
  }, [portfolioSlug, activeTab]);

  const { slug, name, assets, txnQueue } = portfolio;

  const updateAsset = useCallback(
    async (tickerSymbol: string, updateField: { field: string; value: string | number } | null) => {
      const portfolioData = await window.electronAPI.updateStock(slug, tickerSymbol, updateField);

      setPortfolio(portfolioData);
    },
    [slug]
  );

  const deleteAsset = useCallback(
    async (tickerSymbol: string) => {
      const portfolioData = await window.electronAPI.deleteStock(slug, tickerSymbol);

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
            deleteAsset,
          }}
        />
      );
      break;
    case "Composition":
      tabPage = <Composition {...{ assets }} />;
      break;
    case "Calculator":
      tabPage = <Calculator portfolioSlug={slug} {...{ assets, txnQueue }} />;
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
        setOpenTabs,
      }}
    >
      <div className="space-y-6 p-8">
        <div className="flex space-x-6">
          <p className="text-4xl font-semibold">{name}</p>
          <div className="flex items-center text-emerald-500 bg-emerald-800/40 rounded-lg px-4 py-1">
            <p>Stocks</p>
          </div>
        </div>
        <div className="overflow-y-auto">{tabPage}</div>
      </div>
    </TabLayout>
  ) : null;
};

export default Portfolio;
