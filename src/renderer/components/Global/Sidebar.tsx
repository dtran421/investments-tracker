import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillHome, AiOutlinePlus, AiOutlineStock } from "react-icons/ai";

type PageButtonProps = {
    icon: ReactNode;
    link: string;
    goToPage: (link: string) => void;
    special?: boolean;
};

const PageButton = ({
    icon,
    link,
    goToPage,
    special = false
}: PageButtonProps) => {
    return (
        <button
            type="button"
            className={`${
                special
                    ? "bg-neutral-600/50 hover:bg-orange-400"
                    : "bg-neutral-700/50 hover:bg-neutral-500/50"
            } transition duration-100 ease-in rounded-full p-2`}
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
        <div className="w-14 xl:w-24 h-screen flex flex-col justify-between border-r-2 border-neutral-700/40 py-4">
            <div className="space-y-3">
                <div className="flex flex-col items-center">
                    <PageButton
                        icon={
                            <AiOutlineStock
                                size={20}
                                className="text-orange-400"
                            />
                        }
                        link="/portfolio/"
                        {...{ goToPage }}
                    />
                </div>
                <div className="flex-grow border-b-2 border-neutral-500/50 mx-2" />
                <div className="flex flex-col items-center">
                    <PageButton
                        icon={
                            <AiOutlinePlus
                                size={20}
                                className="text-emerald-400"
                            />
                        }
                        link="/"
                        {...{ goToPage }}
                    />
                </div>
            </div>
            <div className="flex justify-center">
                <PageButton
                    icon={<AiFillHome size={20} className="text-white" />}
                    link="/"
                    {...{ goToPage }}
                    special
                />
            </div>
        </div>
    );
};

export default Sidebar;
