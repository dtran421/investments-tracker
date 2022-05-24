import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlinePlus, AiOutlineStock } from "react-icons/ai";

type PageButtonProps = {
    icon: ReactNode;
    link: string;
    goToPage: (link: string) => void;
};

const PageButton = ({ icon, link, goToPage }: PageButtonProps) => {
    return (
        <button
            type="button"
            className="bg-neutral-800/80 rounded-full p-2"
            onClick={() => goToPage(link)}
        >
            {icon}
        </button>
    );
};

const Sidebar = () => {
    const navigate = useNavigate();

    const goToPage = (link: string) => {
        navigate(link);
    };

    return (
        <div className="w-14 xl:w-24 h-screen border-r-2 border-neutral-700/40 space-y-3 py-4">
            <div className="flex flex-col items-center">
                <PageButton
                    icon={
                        <AiOutlineStock size={20} className="text-orange-400" />
                    }
                    link=""
                    {...{ goToPage }}
                />
            </div>
            <div className="flex-grow border-b-2 border-neutral-500/50 mx-2" />
            <div className="flex flex-col items-center">
                <PageButton
                    icon={
                        <AiOutlinePlus size={20} className="text-emerald-400" />
                    }
                    link="/"
                    {...{ goToPage }}
                />
            </div>
        </div>
    );
};

export default Sidebar;
