import {
    ChangeEvent,
    Dispatch,
    FormEvent,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FiDollarSign, FiMinus, FiPercent } from "react-icons/fi";
import Contexts from "../../../../Contexts";

interface DefaultCellProps {
    value: string;
}

export const DefaultCell = ({ value }: DefaultCellProps) => {
    return <p className="text-lg text-center py-1">{value}</p>;
};

interface EditCellProps {
    initialValue: number;
    symbol: string;
    field: string;
    toggleEditing: Dispatch<SetStateAction<boolean>>;
}

export const EditCell = ({
    initialValue,
    symbol,
    field,
    toggleEditing
}: EditCellProps) => {
    const { PortfolioContext } = Contexts;
    const { updateAsset } = useContext(PortfolioContext);

    const inputRef = useRef<HTMLInputElement>(null);

    const [value, setValue] = useState(initialValue.toString());

    useEffect(() => {
        inputRef?.current?.focus();
    }, [initialValue]);

    const onChange = (ev: ChangeEvent) => {
        const { value: inputValue } = ev.target as HTMLInputElement;
        const numInput = parseInt(inputValue, 10);
        if (inputValue === "") {
            setValue("0");
        } else if (/\d+\.?\d*/.test(inputValue)) {
            if (parseInt(value, 10) === 0) {
                if (numInput === 0 || Number.isNaN(numInput)) {
                    setValue(value);
                } else {
                    setValue(numInput.toString());
                }
            } else {
                setValue(inputValue);
            }
        }
    };

    const updateAssetField = (ev: FormEvent) => {
        updateAsset(ev, symbol, { field, value: parseFloat(value) });
        toggleEditing(false);
    };

    return (
        <form onSubmit={updateAssetField}>
            <input
                ref={inputRef}
                value={value}
                className="w-full bg-transparent text-lg text-center outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-neutral-800 rounded-lg p-1"
                onChange={onChange}
                onBlur={() => toggleEditing(false)}
            />
        </form>
    );
};

interface NumberCellProps {
    type: "plain" | "dollar" | "percent";
    amount: number;
    symbol?: string;
    field?: string;
    showGain?: boolean;
    editable?: boolean;
    lastRow?: boolean;
}

export const NumberCell = ({
    type,
    amount,
    symbol = "",
    field = "",
    showGain = false,
    editable = false,
    lastRow = false
}: NumberCellProps) => {
    const [isEditing, toggleEditing] = useState(false);

    const gained = amount >= 0;
    const sign = gained ? "+" : "-";

    const gainClass = gained ? "text-emerald-500" : "text-rose-500";

    const zeroCell =
        amount === 0 || amount === Infinity || Number.isNaN(amount);

    if (lastRow) {
        return null;
    }

    return isEditing ? (
        <EditCell initialValue={amount} {...{ symbol, field, toggleEditing }} />
    ) : (
        <button
            type="button"
            className={`w-full h-full flex justify-center items-center text-lg ${
                showGain ? gainClass : "text-white"
            } py-1`}
            onClick={() => toggleEditing(!isEditing)}
            disabled={!editable}
        >
            {zeroCell ? (
                <FiMinus size={18} />
            ) : (
                <>
                    <span>{showGain && sign}</span>
                    {type === "dollar" && <FiDollarSign size={18} />}
                    <span>{amount.toFixed(type === "plain" ? 6 : 2)}</span>
                    {type === "percent" && <FiPercent size={18} />}
                </>
            )}
        </button>
    );
};

export const AddCell = () => {
    const { PortfolioContext } = Contexts;
    const { updateAsset } = useContext(PortfolioContext);

    const inputRef = useRef(null);

    const [stockTicker, setValue] = useState("");
    const [isEditing, toggleIsEditing] = useState(false);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            (inputRef.current as HTMLInputElement).focus();
        }
    }, [isEditing]);

    const reset = () => {
        toggleIsEditing(!isEditing);
        setValue("");
    };

    const addAsset = (ev: FormEvent) => {
        updateAsset(ev, stockTicker, null);
        reset();
    };

    return (
        <div className="flex justify-center">
            {isEditing ? (
                <form onSubmit={addAsset} className="flex justify-center">
                    <input
                        ref={inputRef}
                        value={stockTicker}
                        className="w-3/4 text-lg text-center bg-transparent outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-neutral-800 rounded-lg px-2 py-1 mx-2"
                        onChange={(ev: ChangeEvent) => {
                            setValue(
                                (
                                    ev.target as HTMLInputElement
                                ).value.toUpperCase()
                            );
                        }}
                        onBlur={() => reset()}
                    />
                </form>
            ) : (
                <button
                    type="button"
                    className="flex items-center text-neutral-300 hover:text-white bg-neutral-700/30 hover:bg-neutral-600/40 transition duration-150 ease-linear rounded-lg space-x-2 px-4 py-2"
                    onClick={() => toggleIsEditing(!isEditing)}
                >
                    <AiOutlinePlus size={18} />
                    <span className="text-lg">Add</span>
                </button>
            )}
        </div>
    );
};
