import {
    Dispatch,
    SetStateAction,
    useRef,
    useEffect,
    useContext,
    useState,
    ChangeEvent,
    FormEvent
} from "react";
import { AiOutlinePlus } from "react-icons/ai";

import validateNumberInput from "../../lib/validateNumberInput";
import Contexts from "../../../../Contexts";

export interface EditableProps {
    symbol: string;
    field: string;
    toggleEditing: Dispatch<SetStateAction<boolean>>;
}

interface EditInputProps extends EditableProps {
    value: string;
    dataType: string;
    onChange: (ev: ChangeEvent) => void;
}

export const EditInput = ({
    symbol,
    field,
    value,
    dataType,
    onChange,
    toggleEditing
}: EditInputProps) => {
    const { PortfolioContext } = Contexts;
    const { updateAsset } = useContext(PortfolioContext);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef?.current?.focus();
    }, []);

    const updateAssetField = async (ev: FormEvent) => {
        ev.preventDefault();
        await updateAsset(symbol, {
            field,
            value: dataType === "string" ? value : Number(value)
        });
        toggleEditing(false);
    };

    return (
        <form onSubmit={updateAssetField}>
            <input
                ref={inputRef}
                className="w-full bg-transparent text-lg text-center outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-neutral-800 rounded-lg p-1"
                onBlur={() => toggleEditing(false)}
                {...{ value, onChange }}
            />
        </form>
    );
};

interface EditCellProps extends EditableProps {
    initialValue: number | string;
}

export const EditCell = ({
    initialValue,
    symbol,
    field,
    toggleEditing
}: EditCellProps) => {
    const dataType = typeof initialValue;
    const [value, setValue] = useState(initialValue.toString());

    const onChange = (ev: ChangeEvent) => {
        const { value: inputValue } = ev.target as HTMLInputElement;

        if (dataType === "number") {
            setValue(validateNumberInput(value, inputValue));
        } else {
            setValue(inputValue);
        }
    };

    return (
        <EditInput
            {...{ symbol, field, value, dataType, onChange, toggleEditing }}
        />
    );
};

export const AddCell = () => {
    const { PortfolioContext } = Contexts;
    const { updateAsset } = useContext(PortfolioContext);

    const inputRef = useRef(null);

    const [tickerSymbol, setValue] = useState("");
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
        ev.preventDefault();
        updateAsset(tickerSymbol, null);
        reset();
    };

    return (
        <div className="h-full flex justify-center items-center">
            {isEditing ? (
                <form onSubmit={addAsset} className="flex justify-center">
                    <input
                        ref={inputRef}
                        value={tickerSymbol}
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
