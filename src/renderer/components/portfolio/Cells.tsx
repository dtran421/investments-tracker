import { useContext, useState } from "react";
import { FiDollarSign, FiMinus, FiPercent } from "react-icons/fi";
import _ from "lodash";

import { AiOutlineClose } from "react-icons/ai";
import { EditCell } from "./EditableCells";

import Contexts from "../../../../Contexts";

interface DefaultCellProps {
    value: string;
}

export const DefaultCell = ({ value }: DefaultCellProps) => {
    return <p className="text-lg text-center">{value}</p>;
};

interface TextCellProps {
    symbol: string;
    value: string;
    editable?: boolean;
    field: string;
}

export const TextCell = ({
    symbol,
    value,
    editable = false,
    field
}: TextCellProps) => {
    const [isEditing, toggleEditing] = useState(false);

    if (isEditing) {
        return (
            <EditCell
                initialValue={value || ""}
                {...{ symbol, field, toggleEditing }}
            />
        );
    }
    if (editable) {
        return (
            <button
                type="button"
                className="w-full h-full flex justify-center items-center py-2"
                onClick={() => toggleEditing(!isEditing)}
            >
                <DefaultCell {...{ value }} />
            </button>
        );
    }
    return (
        <div className="w-full h-full flex justify-center items-center py-2">
            <DefaultCell {...{ value }} />
        </div>
    );
};

interface NumberTextProps {
    type: "plain" | "dollar" | "percent";
    amount: number;
    showGain?: boolean;
}

const NumberText = ({ type, amount, showGain }: NumberTextProps) => {
    const gained = amount >= 0;
    const sign = gained ? "+" : "-";

    const zeroCell = amount === 0;

    return zeroCell ? (
        <FiMinus size={18} />
    ) : (
        <p
            className={`flex justify-center items-center text-lg text-white ${
                // eslint-disable-next-line no-nested-ternary
                showGain
                    ? gained
                        ? "bg-emerald-500/60"
                        : "bg-rose-500/60"
                    : ""
            } rounded-lg px-3 py-2`}
        >
            <span>{showGain && sign}</span>
            {type === "dollar" && <FiDollarSign size={18} />}
            <span>{Math.abs(amount).toFixed(type === "plain" ? 6 : 2)}</span>
            {type === "percent" && <FiPercent size={18} />}
        </p>
    );
};

interface NumberCellProps extends NumberTextProps {
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

    if (lastRow) {
        return null;
    }
    if (isEditing) {
        return (
            <EditCell
                initialValue={amount}
                {...{ symbol, field, toggleEditing }}
            />
        );
    }
    if (editable) {
        return (
            <button
                type="button"
                className="w-full h-full flex justify-center items-center py-2"
                onClick={() => toggleEditing(!isEditing)}
            >
                <NumberText {...{ type, amount, showGain }} />
            </button>
        );
    }
    return (
        <div className="w-full h-full flex justify-center items-center py-2">
            <NumberText {...{ type, amount, showGain }} />
        </div>
    );
};

interface SummaryCellProps extends NumberTextProps {
    columnValues: number[];
}

export const SummaryCell = ({
    type,
    showGain,
    columnValues
}: SummaryCellProps) => {
    const computedValue = _.sum(columnValues);

    return (
        <div className="h-full flex justify-center items-center border-t-2 border-neutral-700 py-4 mx-1">
            <NumberText amount={computedValue} {...{ type, showGain }} />
        </div>
    );
};

interface DeleteCellProps {
    symbol: string;
}

export const DeleteCell = ({ symbol }: DeleteCellProps) => {
    const { PortfolioContext } = Contexts;
    const { deleteAsset } = useContext(PortfolioContext);

    return (
        <div className="h-full flex justify-center items-center">
            <button
                type="button"
                className="flex items-center text-neutral-300 hover:text-white hover:bg-neutral-600/40 transition duration-150 ease-linear rounded-lg group space-x-2 p-2"
                onClick={() => deleteAsset(symbol)}
            >
                <AiOutlineClose
                    size={18}
                    className="text-red-700/75 group-hover:text-red-600"
                />
            </button>
        </div>
    );
};
