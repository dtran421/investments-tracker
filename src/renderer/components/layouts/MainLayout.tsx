import { ReactNode, useEffect, useState } from "react";

import { PortfolioData } from "../../types/frontend";

import Sidebar from "../Global/Sidebar";

interface MainLayoutProps {
  activePage: string;
  children: ReactNode;
}

const MainLayout = ({ activePage, children }: MainLayoutProps) => {
  // TODO: implement dark mode toggle
  const [darkMode] = useState(true);

  const [initialized, setInitialized] = useState(false);
  const [portfolios, setPortfolios] = useState<PortfolioData[]>([]);

  const fetchPortfolios = async () => {
    const portfolios = await window.electronAPI.getPortfolios();

    setPortfolios(portfolios);
    setInitialized(true);
  };

  useEffect(() => {
    if (initialized) {
      return;
    }

    fetchPortfolios();
  }, [initialized]);

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="w-full min-h-screen flex bg-neutral-900 text-black dark:text-white font-sans">
        {portfolios.length ? (
          <>
            <Sidebar {...{ activePage, portfolios }} />
            {children}
          </>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default MainLayout;
