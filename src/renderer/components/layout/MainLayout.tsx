import { ReactNode, useState } from "react";

type MainLayoutProps = {
    children: ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
    const [darkMode, toggleDarkMode] = useState(true);

    return (
        <div className={`${darkMode ? "dark" : ""}`}>
            <div className="w-full h-screen bg-neutral-900 text-black dark:text-white">
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
