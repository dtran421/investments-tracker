import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AiFillHome,
    AiOutlineLeft,
    AiOutlinePlus,
    AiOutlineRight,
    AiOutlineStock
} from "react-icons/ai";
import { Portfolio } from "../../../../types";

interface PageButtonProps {
    icon: ReactNode;
    link: string;
    isActive: boolean;
    isExpanded: boolean;
    portfolioName: string;
    goToPage: (link: string) => void;
}

const PageButton = ({
    icon,
    link,
    isActive,
    isExpanded,
    portfolioName,
    goToPage
}: PageButtonProps) => {
    return (
        <div className="flex items-center space-x-3">
            <button
                type="button"
                className="group bg-neutral-700/50 disabled:bg-orange-500 hover:bg-neutral-500/50 transition duration-100 ease-in rounded-full p-2"
                onClick={() => goToPage(link)}
                disabled={isActive}
            >
                {icon}
            </button>
            {isExpanded && <span>{portfolioName}</span>}
        </div>
    );
};

interface SidebarProps {
    activePage: string;
    portfolios: Portfolio[];
}

const Sidebar = ({ activePage, portfolios }: SidebarProps) => {
    const navigate = useNavigate();

    const [isExpanded, toggleExpanded] = useState(false);

    const goToPage = (link: string) => {
        navigate(link);
    };

    return (
        <div className="relative">
            <div
                className={`${
                    isExpanded ? "w-40" : "w-min"
                } h-screen flex flex-col justify-between bg-neutral-800/70 border-r border-neutral-700/40 space-y-3 px-2 py-4`}
            >
                <div className="flex flex-col items-center space-y-3">
                    <button
                        type="button"
                        className="bg-neutral-600/50 disabled:bg-orange-500 hover:bg-orange-500 transition duration-100 ease-in rounded-full p-2"
                        onClick={() => goToPage("/")}
                        disabled={activePage === "/"}
                    >
                        <AiFillHome size={20} className="text-white" />
                    </button>
                    <div className="w-full border-b border-neutral-500/50" />
                    <div className="flex flex-col items-start space-y-3">
                        {portfolios.map(
                            ({ slug: portfolioSlug, name: portfolioName }) => (
                                <PageButton
                                    key={portfolioSlug}
                                    icon={
                                        <AiOutlineStock
                                            size={20}
                                            className={`${
                                                activePage === portfolioSlug
                                                    ? "text-white"
                                                    : "text-neutral-300 group-hover:text-orange-500"
                                            }`}
                                        />
                                    }
                                    link={`/portfolio/${portfolioSlug}`}
                                    isActive={activePage === portfolioSlug}
                                    {...{
                                        isExpanded,
                                        portfolioName,
                                        goToPage
                                    }}
                                />
                            )
                        )}
                    </div>
                    <div className="w-full border-b border-neutral-500/50" />
                    <div className="flex flex-col items-center">
                        <button
                            type="button"
                            className="bg-neutral-700/50 hover:bg-neutral-500/50 transition duration-100 ease-in rounded-full p-2"
                        >
                            <AiOutlinePlus
                                size={20}
                                className="text-emerald-400"
                            />
                        </button>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="bg-neutral-700/50 hover:bg-neutral-500/50 transition duration-100 ease-in rounded-full p-2"
                        onClick={() => toggleExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <AiOutlineLeft size={18} />
                        ) : (
                            <AiOutlineRight size={18} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
