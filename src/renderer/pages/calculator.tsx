import { ReactNode, useState } from "react";
import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import { FiDollarSign, FiPercent } from "react-icons/fi";
import _ from "lodash";

import { AssetData } from "../../../types";

interface CalculatorCellProps {
    children: ReactNode;
}

const CalculatorCell = ({ children }: CalculatorCellProps) => {
    return (
        <div className="flex justify-center items-center p-4">{children}</div>
    );
};

interface CalculatorProps {
    assets: AssetData[];
}

const Calculator = ({ assets }: CalculatorProps) => {
    const [buyMode, toggleBuyMode] = useState(true);

    const totalPortfolioValue = _.sum(
        _.map(assets, ({ marketValue }) => marketValue)
    );

    return (
        <div className="grid grid-cols-2 mt-10">
            <div className="max-w-2xl flex flex-col items-center space-y-16 mx-auto">
                <div className="w-full flex flex-col items-center border border-neutral-700 rounded-xl">
                    <h2 className="text-2xl font-semibold rounded-t-xl px-4 py-3">
                        Total Portfolio Value
                    </h2>
                    <div className="flex justify-center items-center text-xl font-medium rounded-b-xl px-8 py-6">
                        <FiDollarSign size={18} />
                        <p>{totalPortfolioValue.toFixed(2)}</p>
                    </div>
                </div>
                <div className="w-full grid grid-cols-2 text-xl font-medium border border-neutral-700 rounded-xl last:divide-double divide-y divide-neutral-700">
                    <CalculatorCell>
                        <p>Mode</p>
                    </CalculatorCell>
                    <CalculatorCell>
                        <button
                            type="button"
                            className={`flex justify-between bg-neutral-700/50 ${
                                buyMode
                                    ? "text-emerald-500"
                                    : "flex-row-reverse text-rose-500"
                            } rounded-full gap-x-1 p-1`}
                            onClick={() => toggleBuyMode(!buyMode)}
                        >
                            <p className="px-2">{buyMode ? "Buy" : "Sell"}</p>
                            {buyMode ? (
                                <AiFillPlusCircle size={28} />
                            ) : (
                                <AiFillMinusCircle size={28} />
                            )}
                        </button>
                    </CalculatorCell>
                    <CalculatorCell>
                        <p>Price</p>
                    </CalculatorCell>
                    <CalculatorCell>
                        <FiDollarSign size={18} />
                        <p>110.69</p>
                    </CalculatorCell>
                    <CalculatorCell>
                        <p>Target Allocation</p>
                    </CalculatorCell>
                    <CalculatorCell>
                        <p>110.69</p>
                        <FiPercent size={18} />
                    </CalculatorCell>
                    <CalculatorCell>
                        <p>Market Value</p>
                    </CalculatorCell>
                    <CalculatorCell>
                        <FiDollarSign size={18} />
                        <p>110.69</p>
                    </CalculatorCell>
                </div>
            </div>
        </div>
    );
};

export default Calculator;
