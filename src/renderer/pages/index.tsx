import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";

import MainLayout from "renderer/components/layouts/MainLayout";
import Modal from "renderer/components/index/Modal";

import logo from "../../../assets/logo.png";

interface LinkProps {
    text: string;
    handleClick: () => void;
}

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

    const [showModal, toggleModal] = useState(false);
    const [portfolioName, setPortfolioName] = useState("");

    const createPortfolio = async (ev: FormEvent) => {
        ev.preventDefault();

        const portfolioSlug = await window.electronAPI.createPortfolio(
            portfolioName
        );
        navigate(`/portfolio/${portfolioSlug}`);
    };

    return (
        <MainLayout activePage="/">
            <div className="w-full relative flex justify-center items-center">
                <div className="flex flex-col justify-center items-center space-y-10">
                    <div className="space-y-3">
                        <div className="flex justify-center space-x-4">
                            <div className="flex justify-center items-center space-x-2">
                                <img
                                    alt="logo"
                                    src={logo}
                                    className="w-14 h-14"
                                />
                                <h1 className="text-5xl text-center font-semibold">
                                    Trackify
                                </h1>
                            </div>
                            <div className="flex h-min text-orange-500 bg-orange-700/50 rounded-lg px-3 py-1">
                                <p className="text-lg font-bold">v1</p>
                            </div>
                        </div>
                        <h2 className="text-3xl font-medium text-gray-300/75">
                            For the boldest of bulls
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <ActionLink
                            text="Track Portfolio"
                            handleClick={() => toggleModal(true)}
                        />
                        <ActionLink
                            text="Create Watchlist"
                            handleClick={() => {
                                return null;
                            }}
                        />
                    </div>
                </div>
                {showModal && (
                    <Modal
                        {...{
                            toggleModal,
                            portfolioName,
                            setPortfolioName,
                            createPortfolio
                        }}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default Index;
