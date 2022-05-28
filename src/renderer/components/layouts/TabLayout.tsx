import { Dispatch, ReactNode, SetStateAction } from "react";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import _ from "lodash";

import MainLayout from "./MainLayout";

interface TabProps {
    label: string;
    active: boolean;
    setActiveTab: Dispatch<SetStateAction<string>>;
    openTabs: string[];
    setOpenTabs: Dispatch<SetStateAction<string[]>>;
}

const Tab = ({
    label,
    active,
    setActiveTab,
    openTabs,
    setOpenTabs
}: TabProps) => {
    return (
        <div className="relative group">
            <div
                role="button"
                className={`flex justify-between ${
                    !active
                        ? "text-neutral-300 hover:text-white"
                        : "cursor-default"
                } transition duration-100 ease-in space-x-6 px-3 py-2`}
                onClick={() => !active && setActiveTab(label)}
                onKeyPress={() => !active && setActiveTab(label)}
                tabIndex={active ? -1 : 0}
            >
                <p className="flex items-center select-none bg-transparent focus:outline-none">
                    {label}
                </p>
                <button
                    type="button"
                    className="hover:bg-neutral-600/50 rounded-md transition duration-50 ease-linear p-1"
                    onClick={() => setOpenTabs(_.without(openTabs, label))}
                >
                    <AiOutlineClose size={14} />
                </button>
            </div>
            <div className="absolute bottom-0 w-full px-3">
                <div
                    className={`border-b ${
                        active
                            ? "border-orange-500"
                            : "border-transparent group-hover:border-neutral-300"
                    } transition duration-100 ease-linear`}
                />
            </div>
        </div>
    );
};

interface TabLayoutProps {
    tabs: string[];
    openTabs: string[];
    setOpenTabs: Dispatch<SetStateAction<string[]>>;
    activeTab: string;
    setActiveTab: Dispatch<SetStateAction<string>>;
    activePage: string;
    children: ReactNode;
}

const TabLayout = ({
    tabs,
    openTabs,
    setOpenTabs,
    activeTab,
    setActiveTab,
    activePage,
    children
}: TabLayoutProps) => {
    const modifiedLayout = openTabs.length !== tabs.length;

    return (
        <MainLayout {...{ activePage }}>
            <div className="w-full h-full flex flex-col">
                <div className="w-full flex bg-neutral-800/70 border-b border-neutral-700 px-2 pt-2">
                    {openTabs.map((tab, idx) => (
                        <div key={tab} className="flex items-center">
                            <Tab
                                label={tab}
                                active={activeTab === tab}
                                {...{ setActiveTab, openTabs, setOpenTabs }}
                            />
                            {(idx !== openTabs.length - 1 ||
                                modifiedLayout) && (
                                <div className="h-full flex items-center bg-neutral-800/70 py-2">
                                    <div className="h-full border-r border-neutral-600" />
                                </div>
                            )}
                        </div>
                    ))}
                    {modifiedLayout && (
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="flex items-center bg-orange-700/30 text-orange-400 transition duration-100 ease-in space-x-1 rounded-lg px-2 py-1 ml-3"
                                onClick={() =>
                                    setOpenTabs([
                                        ...openTabs,
                                        _.first(
                                            _.without(tabs, ...openTabs)
                                        ) as string
                                    ])
                                }
                            >
                                <AiOutlinePlus size={14} />
                                <span>View</span>
                            </button>
                        </div>
                    )}
                </div>
                {children}
            </div>
        </MainLayout>
    );
};

export default TabLayout;
