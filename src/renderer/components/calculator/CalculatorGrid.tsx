import {
    ChangeEvent,
    createRef,
    Dispatch,
    FormEvent,
    SetStateAction,
    useEffect
} from "react";
import {
    AiFillPlusCircle,
    AiFillMinusCircle,
    AiFillCaretUp,
    AiFillCaretDown
} from "react-icons/ai";
import { FiPercent } from "react-icons/fi";

import { Grid, CalculatorRow, EditInput, NumberCell } from "./Cells";

import validateNumberInput from "../../lib/validateNumberInput";

interface CalculatorGridProps {
    buyMode: boolean;
    toggleBuyMode: Dispatch<SetStateAction<boolean>>;
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
    buyMode,
    toggleBuyMode,
    tickerSymbol,
    targetAllocation,
    editingTicker,
    submittedTicker,
    setInputs,
    assetPrice,
    marketValue,
    currentAllocation,
    invalidAllocation
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
            <CalculatorRow
                label="Mode"
                field={
                    <button
                        type="button"
                        className={`flex justify-between bg-neutral-700/50 ${
                            buyMode
                                ? "text-emerald-500"
                                : "flex-row-reverse text-rose-500"
                        } rounded-full group space-x-1 p-1`}
                        onClick={() => toggleBuyMode(!buyMode)}
                    >
                        <p className="group-hover:animate-pulse px-2">
                            {buyMode ? "Buy" : "Sell"}
                        </p>
                        {buyMode ? (
                            <AiFillPlusCircle size={28} />
                        ) : (
                            <AiFillMinusCircle size={28} />
                        )}
                    </button>
                }
            />
            <CalculatorRow
                label="Ticker"
                field={
                    <form
                        onSubmit={(ev: FormEvent) => {
                            ev.preventDefault();
                            setInputs([
                                tickerSymbol,
                                targetAllocation,
                                false,
                                true
                            ]);
                        }}
                        className="flex justify-center"
                    >
                        <EditInput
                            ref={tickerInputRef}
                            value={tickerSymbol}
                            handleChange={(ev: ChangeEvent) => {
                                setInputs([
                                    (
                                        ev.target as HTMLInputElement
                                    ).value.toUpperCase(),
                                    "0",
                                    true,
                                    false
                                ]);
                            }}
                            handleBlur={() =>
                                !submittedTicker &&
                                setInputs(["", targetAllocation, true, false])
                            }
                        />
                    </form>
                }
            />
            <CalculatorRow
                label="Price"
                field={<NumberCell type="dollar" value={assetPrice} />}
            />
            <CalculatorRow
                label="Market Value"
                field={<NumberCell type="dollar" value={marketValue} />}
            />
            <CalculatorRow
                label="Current Allocation"
                field={<NumberCell type="percent" value={currentAllocation} />}
            />
            <CalculatorRow
                label="Target Allocation"
                field={
                    <div className="flex items-center space-x-2">
                        <div
                            className={`${
                                invalidAllocation
                                    ? "bg-red-700/40 text-red-500"
                                    : "bg-neutral-700/40 text-orange-500/80"
                            } transition duration-150 ease-linear rounded-lg p-1`}
                        >
                            {buyMode ? (
                                <AiFillCaretUp size={24} />
                            ) : (
                                <AiFillCaretDown size={24} />
                            )}
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
                                            validateNumberInput(
                                                targetAllocation.toString(),
                                                (ev.target as HTMLInputElement)
                                                    .value
                                            ),
                                            editingTicker,
                                            submittedTicker
                                        ]);
                                    }}
                                />
                            </form>
                            <FiPercent size={18} />
                        </div>
                    </div>
                }
                lastRow
            />
        </Grid>
    );
};

export default CalculatorGrid;
