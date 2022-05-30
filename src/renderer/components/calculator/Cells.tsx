import { ChangeEvent, ForwardedRef, forwardRef, ReactNode } from "react";
import { FiMinus, FiDollarSign, FiPercent } from "react-icons/fi";

interface EditInputProps {
    value: string | number;
    handleChange: (ev: ChangeEvent) => void;
    handleBlur?: (ev: ChangeEvent) => void;
}

export const EditInput = forwardRef(
    (
        { value, handleChange, handleBlur }: EditInputProps,
        ref: ForwardedRef<HTMLInputElement>
    ) => {
        return (
            <input
                {...{ ref, value }}
                className="w-3/4 text-lg text-center bg-transparent outline-none ring-2 ring-offset-2 ring-orange-600/50 focus:ring-orange-500 ring-offset-neutral-800 transition duration-150 ease-linear rounded-lg px-2 py-1 mx-2"
                onChange={(ev: ChangeEvent) => handleChange(ev)}
                onBlur={(ev: ChangeEvent) => handleBlur && handleBlur(ev)}
            />
        );
    }
);

interface BaseCellProps {
    lastRow?: boolean;
    children: ReactNode;
}

export const BaseCell = ({ lastRow = false, children }: BaseCellProps) => {
    return (
        <div
            className={`flex justify-center items-center ${
                lastRow ? "border-b-0" : "border-b"
            } border-neutral-700 py-4`}
        >
            {children}
        </div>
    );
};

interface LabelProps {
    text: string;
}

const Label = ({ text }: LabelProps) => {
    return <p className="font-medium">{text}</p>;
};

interface NumberCellProps {
    type: "plain" | "dollar" | "percent";
    value: number;
    buyMode?: boolean;
}

export const NumberCell = ({
    type,
    value,
    buyMode = false
}: NumberCellProps) => {
    const zeroCell = value === 0;

    return zeroCell ? (
        <FiMinus size={18} />
    ) : (
        <>
            {buyMode && <span>(</span>}
            {type === "dollar" && <FiDollarSign size={18} />}
            <span>{value.toFixed(type === "plain" ? 6 : 2)}</span>
            {type === "percent" && <FiPercent size={18} />}
            {buyMode && <span>)</span>}
        </>
    );
};

interface CalculatorRowProps {
    label: string | ReactNode;
    field: ReactNode;
    lastRow?: boolean;
}

export const CalculatorRow = ({
    label,
    field,
    lastRow = false
}: CalculatorRowProps) => {
    return (
        <>
            <BaseCell {...{ lastRow }}>
                {typeof label === "string" ? <Label text={label} /> : label}
            </BaseCell>
            <BaseCell {...{ lastRow }}>{field}</BaseCell>
        </>
    );
};

interface GridProps {
    children: ReactNode;
}

export const Grid = ({ children }: GridProps) => {
    return (
        <div className="w-full grid grid-cols-2 text-xl border border-neutral-700 rounded-lg px-8">
            {children}
        </div>
    );
};

interface HeadingLabelProps {
    children: string;
}

export const HeadingLabel = ({ children }: HeadingLabelProps) => {
    return (
        <div className="flex justify-center items-center">
            <h3 className="text-base text-neutral-500 text-center">
                {children}
            </h3>
        </div>
    );
};

interface TxnCellProps {
    buyMode: boolean;
    special?: "first" | "last" | "";
    children: ReactNode;
}

export const TxnCell = ({ buyMode, special, children }: TxnCellProps) => {
    return (
        <div
            className={`flex justify-center items-center ${
                buyMode
                    ? "bg-green-400/30 border-green-500"
                    : "bg-red-400/30 border-red-500"
            } ${special === "first" ? `border-l-4 rounded-l-lg` : ""} ${
                special === "last" ? "rounded-r-lg" : ""
            } py-4`}
        >
            {children}
        </div>
    );
};
