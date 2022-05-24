import { useNavigate } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";

import MainLayout from "renderer/components/layout/MainLayout";

type LinkProps = {
    text: string;
    handleClick: () => void;
};

const ActionLink = ({ text, handleClick }: LinkProps) => {
    return (
        <button
            type="button"
            className="flex items-center text-orange-500 hover:text-neutral-100 transition duration-150 ease-linear space-x-2"
            onClick={() => handleClick()}
        >
            <AiOutlinePlus size={20} />
            <span className="text-lg">{text}</span>
        </button>
    );
};

const Index = () => {
    const navigate = useNavigate();

    const createPortfolio = () => {
        window.electron.ipcRenderer.sendMessage("ipc-example", ["ping"]);
        navigate("/portfolio");
    };

    return (
        <MainLayout>
            <div className="w-full h-screen flex flex-col justify-center items-center bg-neutral-900 space-y-10">
                <div className="space-y-3">
                    <h1 className="text-5xl text-center font-semibold">
                        Trackify
                    </h1>
                    <h2 className="text-3xl font-medium text-gray-300/75">
                        For the boldest of bulls
                    </h2>
                </div>
                <div className="space-y-4">
                    <ActionLink
                        text="Track Portfolio"
                        handleClick={() => createPortfolio()}
                    />
                    <ActionLink
                        text="Create Watchlist"
                        handleClick={() => createPortfolio()}
                    />
                </div>
            </div>
        </MainLayout>
    );
};

export default Index;
