import { ReactNode, useState } from "react";

import Sidebar from "../Global/Sidebar";

type MainLayoutProps = {
    showNav?: boolean;
    children: ReactNode;
};

const MainLayout = ({ showNav = true, children }: MainLayoutProps) => {
    // TODO: implement dark mode toggle
    const [darkMode] = useState(true);

    return (
        <div className={`${darkMode ? "dark" : ""}`}>
            <div className="w-full h-screen bg-neutral-900 text-black dark:text-white font-sans">
                {showNav ? (
                    <div className="flex">
                        <Sidebar />
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
