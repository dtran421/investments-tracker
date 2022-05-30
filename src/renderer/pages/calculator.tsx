import { FormEvent, Fragment, useCallback, useEffect, useState } from "react";
import {
    FiCheck,
    FiDollarSign,
    FiPieChart,
    FiPlusCircle,
    FiX,
    FiXCircle
} from "react-icons/fi";
import _ from "lodash";

import {
    CalculatorRow,
    Grid,
    HeadingLabel,
    NumberCell,
    TxnCell
} from "../components/calculator/Cells";

import { AssetData, Transaction } from "../../../types";
import CalculatorGrid from "../components/calculator/CalculatorGrid";

interface CalculatorProps {
    portfolioSlug: string;
    assets: AssetData[];
    txnQueue: Transaction[];
}

const Calculator = ({
    portfolioSlug,
    assets,
    txnQueue: inTxnQueue
}: CalculatorProps) => {
    const totalPortfolioValue = _.sum(
        _.map(assets, ({ marketValue: assetMarketValue }) => assetMarketValue)
    );

    const [isInitialLoad, toggleInitialLoad] = useState(true);

    const [buyMode, toggleBuyMode] = useState(true);

    const [
        [tickerSymbol, targetAllocation, editingTicker, submittedTicker],
        setInputs
    ] = useState<[string, string, boolean, boolean]>(["", "0", true, false]);
    const [[assetPrice, marketValue, currentAllocation], setFixedValues] =
        useState([0, 0, 0]);

    const [sharesMode, toggleSharesMode] = useState(true);
    const [[shares, costBasis], setTxnQuantities] = useState([0, 0]);

    const [txnQueue, setTxnQueue] = useState<Transaction[]>(inTxnQueue);

    const getStockQuote = useCallback(
        async (asset: AssetData | undefined, ev?: FormEvent) => {
            ev?.preventDefault();

            const price = tickerSymbol
                ? (await window.electronAPI.getStockQuote(tickerSymbol))[
                      tickerSymbol
                  ]
                : 0;
            const newMarketValue = asset ? asset.marketValue : 0;
            const newCurrentAllocation = asset ? asset.allocation : 0;

            setInputs([
                tickerSymbol,
                targetAllocation !== "0"
                    ? targetAllocation
                    : newCurrentAllocation.toFixed(2),
                editingTicker,
                false
            ]);
            setFixedValues([price, newMarketValue, newCurrentAllocation]);
        },
        [editingTicker, targetAllocation, tickerSymbol]
    );

    useEffect(() => {
        if (isInitialLoad) {
            const transactionDataJSON =
                window.localStorage.getItem("transactionData");
            if (transactionDataJSON) {
                const {
                    buyMode: newBuyMode,
                    tickerSymbol: newTickerSymbol,
                    targetAllocation: newTargetAllocation,
                    shares: newShares,
                    costBasis: newCostBasis
                } = JSON.parse(transactionDataJSON);

                toggleBuyMode(newBuyMode);
                setInputs([
                    newTickerSymbol || "",
                    newTargetAllocation || "0",
                    false,
                    true
                ]);
                setTxnQuantities([newShares, newCostBasis]);
            }
            toggleInitialLoad(!isInitialLoad);
        }
    }, [getStockQuote, isInitialLoad]);

    useEffect(() => {
        window.localStorage.setItem(
            "transactionData",
            JSON.stringify({
                buyMode,
                tickerSymbol,
                targetAllocation,
                shares,
                costBasis
            })
        );
    }, [targetAllocation, costBasis, shares, tickerSymbol, buyMode]);

    useEffect(() => {
        if (submittedTicker) {
            getStockQuote(_.find(assets, ["symbol", tickerSymbol]));
        }

        if (tickerSymbol && targetAllocation && Number(targetAllocation) > 0) {
            const decimalAllocation = Number(targetAllocation) / 100;

            const newCostBasis =
                decimalAllocation * totalPortfolioValue - marketValue;
            const newShares = costBasis / assetPrice;

            setTxnQuantities([
                Math.abs(Number(newShares.toFixed(6))),
                Math.abs(Number(newCostBasis.toFixed(2)))
            ]);
        }
    }, [
        submittedTicker,
        assets,
        tickerSymbol,
        assetPrice,
        getStockQuote,
        totalPortfolioValue,
        marketValue,
        targetAllocation,
        costBasis
    ]);

    const [invalidAllocation, toggleInvalidAllocation] = useState(false);
    useEffect(() => {
        if (!editingTicker) {
            if (buyMode && Number(targetAllocation) <= currentAllocation) {
                toggleInvalidAllocation(true);
            } else if (
                !buyMode &&
                Number(targetAllocation) >= currentAllocation
            ) {
                toggleInvalidAllocation(true);
            } else {
                toggleInvalidAllocation(false);
            }
        } else {
            toggleInvalidAllocation(false);
        }
    }, [buyMode, currentAllocation, editingTicker, targetAllocation]);

    const reset = () => {
        setInputs(["", "0", true, false]);
        setFixedValues([0, 0, 0]);
        setTxnQuantities([0, 0]);
    };

    const appendTxn = async () => {
        const newTxnQueue = await window.electronAPI.updateTxn(portfolioSlug, {
            mode: buyMode ? "buy" : "sell",
            symbol: tickerSymbol,
            allocation: Number(targetAllocation),
            shares,
            costBasis
        });
        setTxnQueue(newTxnQueue);
        reset();
    };

    const removeTxn = async (symbol: string, updateAsset: boolean) => {
        const newTxnQueue = await window.electronAPI.deleteTxn(
            portfolioSlug,
            symbol,
            updateAsset
        );
        setTxnQueue(newTxnQueue);
    };

    return (
        <div className="grid grid-cols-2 mx-auto mt-6">
            <div className="w-3/4 flex flex-col items-center space-y-10 mx-auto">
                <div className="w-full flex flex-col items-center border border-neutral-700 rounded-lg">
                    <h2 className="text-2xl font-semibold rounded-t-xl px-4 py-3">
                        Total Portfolio Value
                    </h2>
                    <div className="flex justify-center items-center text-2xl font-medium py-4">
                        <FiDollarSign size={22} />
                        <p>{totalPortfolioValue.toFixed(2)}</p>
                    </div>
                </div>
                <CalculatorGrid
                    {...{
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
                    }}
                />
                <Grid>
                    <CalculatorRow
                        label={
                            <button
                                type="button"
                                className="w-full flex justify-center items-center font-medium bg-orange-500 hover:bg-orange-400 transition duration-100 ease-in rounded-lg space-x-2 p-4"
                                onClick={() => toggleSharesMode(!sharesMode)}
                            >
                                <div className="bg-white text-orange-500 rounded-full p-1">
                                    {sharesMode ? (
                                        <FiPieChart size={20} />
                                    ) : (
                                        <FiDollarSign size={20} />
                                    )}
                                </div>
                                <span>
                                    {sharesMode ? "SHARES" : "COST BASIS"}
                                </span>
                            </button>
                        }
                        field={
                            <NumberCell
                                type={sharesMode ? "plain" : "dollar"}
                                value={sharesMode ? shares : costBasis}
                                {...{ buyMode }}
                            />
                        }
                    />
                    <CalculatorRow
                        label={
                            <button
                                type="button"
                                className="flex items-center bg-red-600 hover:bg-red-500 transition duration-100 ease-in rounded-full space-x-2 px-8 py-2"
                                onClick={() => reset()}
                            >
                                <FiXCircle size={24} />
                                <span>Clear</span>
                            </button>
                        }
                        field={
                            <button
                                type="button"
                                className="flex items-center bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-neutral-400 transition duration-100 ease-in rounded-full space-x-2 px-8 py-2"
                                onClick={() => appendTxn()}
                                disabled={
                                    !_.every([
                                        tickerSymbol,
                                        targetAllocation,
                                        shares,
                                        costBasis,
                                        !editingTicker
                                    ]) ||
                                    invalidAllocation ||
                                    Boolean(
                                        _.find(txnQueue, [
                                            "symbol",
                                            tickerSymbol
                                        ])
                                    )
                                }
                            >
                                <FiPlusCircle size={24} />
                                <span>Queue</span>
                            </button>
                        }
                        lastRow
                    />
                </Grid>
            </div>
            <div className="h-full flex justify-center">
                <div className="w-3/4 flex flex-col items-center border border-neutral-700 rounded-lg space-y-4">
                    <div className="w-full h-min bg-orange-500 rounded-t-lg border-b border-neutral-700">
                        <h2 className="text-2xl font-semibold text-center p-4">
                            Transaction Queue
                        </h2>
                    </div>
                    <div className="w-full grid grid-cols-5 text-xl font-medium gap-y-4 px-4">
                        <div />
                        <HeadingLabel>Symbol</HeadingLabel>
                        <HeadingLabel>Target Allocation</HeadingLabel>
                        <HeadingLabel>Shares</HeadingLabel>
                        <HeadingLabel>Cost Basis</HeadingLabel>
                        {txnQueue.map(
                            ({
                                mode,
                                symbol,
                                allocation,
                                shares: txnShares,
                                costBasis: txnCostBasis
                            }) => (
                                <Fragment key={symbol}>
                                    <div className="w-full flex justify-start items-center space-x-4 pl-2">
                                        <button
                                            type="button"
                                            className="hover:bg-blue-500 border-2 border-blue-500 transition duration-100 ease-in rounded-full p-1"
                                            onClick={() => {
                                                removeTxn(symbol, true);
                                            }}
                                        >
                                            <FiCheck
                                                size={20}
                                                className="text-neutral-300 hover:text-white transition duration-100 ease-in"
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            className="hover:bg-red-500 border-2 border-red-500 transition duration-100 ease-in rounded-full p-1"
                                            onClick={() => {
                                                removeTxn(symbol, false);
                                            }}
                                        >
                                            <FiX
                                                size={20}
                                                className="text-neutral-300 hover:text-white transition duration-100 ease-in"
                                            />
                                        </button>
                                    </div>
                                    <TxnCell
                                        buyMode={mode === "buy"}
                                        special="first"
                                    >
                                        {symbol}
                                    </TxnCell>
                                    <TxnCell buyMode={mode === "buy"}>
                                        <NumberCell
                                            type="percent"
                                            value={allocation}
                                        />
                                    </TxnCell>
                                    <TxnCell buyMode={mode === "buy"}>
                                        <NumberCell
                                            type="plain"
                                            value={txnShares}
                                            buyMode={mode === "buy"}
                                        />
                                    </TxnCell>
                                    <TxnCell
                                        buyMode={mode === "buy"}
                                        special="last"
                                    >
                                        <NumberCell
                                            type="dollar"
                                            value={txnCostBasis}
                                            buyMode={mode === "buy"}
                                        />
                                    </TxnCell>
                                </Fragment>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calculator;
