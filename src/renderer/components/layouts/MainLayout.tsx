import { ReactNode, useEffect, useState } from "react";

import { Portfolio } from "../../types/types";

import Sidebar from "../global/Sidebar";

interface MainLayoutProps {
  activePage: string;
  children: ReactNode;
}

const MainLayout = ({ activePage, children }: MainLayoutProps) => {
  // TODO: implement dark mode toggle
  const [darkMode] = useState(true);

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  useEffect(() => {
    const fetchPortfolios = async () => {
      const newPortfolios = await window.electronAPI.getPortfolios();

      setPortfolios(newPortfolios);
    };

    fetchPortfolios();
  }, []);

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
