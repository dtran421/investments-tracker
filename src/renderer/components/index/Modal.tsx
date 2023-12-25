import { Dispatch, FormEvent, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ModalProps {
  toggleModal: Dispatch<SetStateAction<boolean>>;
}

const Modal = ({ toggleModal }: ModalProps) => {
  const navigate = useNavigate();

  const modalRef = useRef<HTMLFormElement>(null);

  const handleOutsideClick = useCallback(
    (ev: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(ev.target as Node)) {
        toggleModal(false);
      }
    },
    [modalRef, toggleModal]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [toggleModal, handleOutsideClick]);

  const [portfolioName, setPortfolioName] = useState("");
  const [isValidInput, setValidInput] = useState(portfolioName !== "");

  const createPortfolio = async (ev: FormEvent) => {
    ev.preventDefault();

    const portfolioSlug = await window.electronAPI.createPortfolio(portfolioName);
    navigate(`/portfolio/${portfolioSlug}`);
  };

  return (
    <div className="absolute z-10 left-0 top-0 w-full h-screen flex justify-center items-center bg-neutral-900/80 backdrop-blur-sm">
      <form
        ref={modalRef}
        onSubmit={createPortfolio}
        className="flex flex-col items-center bg-neutral-800 border border-neutral-700/75 rounded-lg space-y-14 px-8 py-4"
      >
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-4xl font-semibold">New Portfolio</h1>
          <div className="flex items-center space-x-6">
            <p className="text-xl">Portfolio Name</p>
            <input
              type="text"
              className="text-black text-xl outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-orange-500 rounded-lg px-2 py-1"
              onChange={(event) => {
                setPortfolioName(event.target.value);
                setValidInput(event.target.value !== "");
              }}
            />
          </div>
        </div>
        <button
          type="submit"
          className="text-2xl disabled:text-gray-400 bg-orange-500 disabled:bg-orange-500/40 rounded-lg px-6 py-2"
          disabled={!isValidInput}
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default Modal;
