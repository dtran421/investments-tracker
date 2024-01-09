import { ChangeEvent, ForwardedRef, forwardRef, ReactNode } from "react";
import { FiMinus, FiDollarSign, FiPercent } from "react-icons/fi";
import { cn } from "utils-toolkit";
import { TransactionMode } from "../../types/frontend";

interface EditInputProps {
  value: string | number;
  handleChange: (ev: ChangeEvent) => void;
  handleBlur?: (ev: ChangeEvent) => void;
}

export const EditInput = forwardRef(
  ({ value, handleChange, handleBlur }: EditInputProps, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <input
        {...{ ref, value }}
        className="w-3/4 text-lg text-center bg-transparent outline-none ring-2 ring-offset-2 ring-orange-600/50 focus:ring-orange-500 ring-offset-neutral-800 transition duration-150 ease-linear rounded-lg px-2 py-1 mx-2"
        onChange={handleChange}
        onBlur={handleBlur}
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
    <div className={`flex justify-center items-center ${lastRow ? "border-b-0" : "border-b"} border-neutral-700 py-4`}>
      {children}
    </div>
  );
};

interface NumberCellProps {
  type: "plain" | "dollar" | "percent";
  value: number;
  transactionMode?: TransactionMode;
}

export const NumberCell = ({ type, value, transactionMode = TransactionMode.SELL }: NumberCellProps) => {
  const zeroCell = value === 0;

  return zeroCell ? (
    <FiMinus size={18} />
  ) : (
    <>
      {transactionMode === TransactionMode.BUY && <span>(</span>}
      {type === "dollar" && <FiDollarSign size={18} />}
      <span>{value.toFixed(type === "plain" ? 6 : 2)}</span>
      {type === "percent" && <FiPercent size={18} />}
      {transactionMode === TransactionMode.BUY && <span>)</span>}
    </>
  );
};

interface GridProps {
  children: ReactNode;
}

export const Grid = ({ children }: GridProps) => {
  return <div className="w-full grid grid-cols-2 text-xl border border-neutral-700 rounded-lg px-8">{children}</div>;
};

interface HeadingLabelProps {
  children: string;
}

export const HeadingLabel = ({ children }: HeadingLabelProps) => {
  return (
    <div className="flex justify-center items-center">
      <h3 className="text-base text-neutral-500 text-center">{children}</h3>
    </div>
  );
};

interface TxnCellProps {
  transactionMode: TransactionMode;
  children: ReactNode;
}

export const TxnCell = ({ transactionMode, children }: TxnCellProps) => {
  return (
    <div
      className={cn("flex justify-center items-center first:border-l-4 first:rounded-l-lg last:rounded-r-lg py-4", {
        ["bg-green-400/30 border-green-500"]: transactionMode === TransactionMode.BUY,
        ["bg-red-400/30 border-red-500"]: transactionMode === TransactionMode.SELL,
      })}
    >
      {children}
    </div>
  );
};
