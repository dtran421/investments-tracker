import { ChangeEvent, createRef, Dispatch, FormEvent, SetStateAction, useEffect } from "react";
import { AiFillPlusCircle, AiFillMinusCircle, AiFillCaretUp, AiFillCaretDown } from "react-icons/ai";
import { FiPercent } from "react-icons/fi";

import { Grid, EditInput, NumberCell, BaseCell } from "./Cells";

import validateNumberInput from "../../utils/validateNumberInput";
import { TransactionMode } from "renderer/types/frontend";

interface CalculatorRowProps {
  label: string | JSX.Element;
  children: JSX.Element;
}

export const CalculatorRow = ({ label, children }: CalculatorRowProps) => {
  const LabelComponent = () => (typeof label === "string" ? <p className="font-medium">{label}</p> : label);

  return (
    <>
      <BaseCell>
        <LabelComponent />
      </BaseCell>
      <BaseCell>{children}</BaseCell>
    </>
  );
};

interface CalculatorGridProps {
  transactionMode: TransactionMode;
  setTransactionMode: (transactionMode: TransactionMode) => void;
  tickerSymbol: string;
  targetAllocation: string;
  editingTicker: boolean;
  submittedTicker: boolean;
  setInputs: Dispatch<SetStateAction<[string, string, boolean, boolean]>>;
  assetPrice: number;
  marketValue: number;
  currentAllocation: number;
  invalidAllocation: boolean;
}

const CalculatorGrid = ({
  transactionMode,
  setTransactionMode,
  tickerSymbol,
  targetAllocation,
  editingTicker,
  submittedTicker,
  setInputs,
  assetPrice,
  marketValue,
  currentAllocation,
  invalidAllocation,
}: CalculatorGridProps) => {
  const tickerInputRef = createRef<HTMLInputElement>();
  const allocationInputRef = createRef<HTMLInputElement>();

  useEffect(() => {
    if (submittedTicker) {
      tickerInputRef?.current?.blur();
    }
  });

  return (
    <Grid>
      <CalculatorRow label="Mode">
        <button
          type="button"
          className={`flex justify-between bg-neutral-700/50 ${
            transactionMode === TransactionMode.BUY ? "text-emerald-500" : "flex-row-reverse text-rose-500"
          } rounded-full group space-x-1 p-1`}
          onClick={() =>
            setTransactionMode(transactionMode === TransactionMode.BUY ? TransactionMode.SELL : TransactionMode.BUY)
          }
        >
          <p className="group-hover:animate-pulse px-2">{transactionMode === TransactionMode.BUY ? "Buy" : "Sell"}</p>
          {transactionMode === TransactionMode.BUY ? <AiFillPlusCircle size={28} /> : <AiFillMinusCircle size={28} />}
        </button>
      </CalculatorRow>
      <CalculatorRow label="Ticker">
        <form
          onSubmit={(ev: FormEvent) => {
            ev.preventDefault();
            setInputs([tickerSymbol, targetAllocation, false, true]);
          }}
          className="flex justify-center"
        >
          <EditInput
            ref={tickerInputRef}
            value={tickerSymbol}
            handleChange={(ev: ChangeEvent) => {
              setInputs([(ev.target as HTMLInputElement).value.toUpperCase(), "0", true, false]);
            }}
            handleBlur={() => !submittedTicker && setInputs(["", targetAllocation, true, false])}
          />
        </form>
      </CalculatorRow>
      <CalculatorRow label="Price">
        <NumberCell type="dollar" value={assetPrice} />
      </CalculatorRow>
      <CalculatorRow label="Market Value">
        <NumberCell type="dollar" value={marketValue} />
      </CalculatorRow>
      <CalculatorRow label="Current Allocation">
        <NumberCell type="percent" value={currentAllocation} />
      </CalculatorRow>
      <CalculatorRow label="Target Allocation">
        <div className="flex items-center space-x-2">
          <div
            className={`${
              invalidAllocation ? "bg-red-700/40 text-red-500" : "bg-neutral-700/40 text-orange-500/80"
            } transition duration-150 ease-linear rounded-lg p-1`}
          >
            {transactionMode === TransactionMode.BUY ? <AiFillCaretUp size={24} /> : <AiFillCaretDown size={24} />}
          </div>
          <div className="flex items-center">
            <form
              onSubmit={(ev: FormEvent) => {
                ev.preventDefault();
                allocationInputRef?.current?.blur();
              }}
              className="w-full flex justify-center"
            >
              <EditInput
                ref={allocationInputRef}
                value={targetAllocation}
                handleChange={(ev: ChangeEvent) => {
                  setInputs([
                    tickerSymbol,
                    validateNumberInput(targetAllocation.toString(), (ev.target as HTMLInputElement).value),
                    editingTicker,
                    submittedTicker,
                  ]);
                }}
              />
            </form>
            <FiPercent size={18} />
          </div>
        </div>
      </CalculatorRow>
    </Grid>
  );
};

export default CalculatorGrid;
