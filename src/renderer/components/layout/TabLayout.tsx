import { ReactNode } from "react";
import { AiOutlineClose } from "react-icons/ai";

import MainLayout from "./MainLayout";

type TabProps = {
    label: string;
};

const Tab = ({ label }: TabProps) => {
    return (
        <button
            type="button"
            className="flex items-center bg-neutral-900 rounded-t-lg space-x-4 px-2 py-1"
        >
            <span>{label}</span>
            <button
                type="button"
                className="hover:bg-neutral-600/50 rounded-md transition duration-50 ease-linear p-1 -mr-1"
            >
                <AiOutlineClose />
            </button>
        </button>
    );
};

type TabLayoutProps = { children: ReactNode };

const TabLayout = ({ children }: TabLayoutProps) => {
    return (
        <MainLayout>
            <div className="w-full flex flex-col">
                <div className="w-full flex bg-orange-400 pl-2 pt-1">
                    <Tab label="Holdings" />
                </div>
                {children}
            </div>
        </MainLayout>
    );
};

export default TabLayout;
