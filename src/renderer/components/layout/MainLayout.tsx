import { ReactNode, useEffect, useState } from "react";

import { Portfolio } from "../../../../types";

import Sidebar from "../Global/Sidebar";

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
            <div className="w-full h-screen bg-neutral-900 text-black dark:text-white font-sans">
                {portfolios.length ? (
                    <div className="h-full flex">
                        <Sidebar {...{ activePage, portfolios }} />
                        {children}
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
};

export default MainLayout;
