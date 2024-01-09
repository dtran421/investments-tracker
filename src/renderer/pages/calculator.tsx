import { FormEvent, Fragment, useCallback, useEffect, useState } from "react";
import { FiCheck, FiDollarSign, FiPieChart, FiPlusCircle, FiX, FiXCircle } from "react-icons/fi";
import _ from "lodash";

import { Grid, HeadingLabel, NumberCell, TxnCell } from "../components/calculator/Cells";

import { AssetData } from "../types/frontend";
import { Transaction, TransactionMode } from "renderer/types/db";
import CalculatorGrid, { CalculatorRow } from "../components/calculator/CalculatorGrid";

interface CalculatorProps {
  portfolioSlug: string;
  assets: AssetData[];
  transactionQueue: Transaction[];
}

const Calculator = (props: CalculatorProps) => {
  const totalPortfolioValue = _.sum(_.map(props.assets, ({ marketValue: assetMarketValue }) => assetMarketValue));

  const [isInitialLoad, toggleInitialLoad] = useState(true);

  const [transactionMode, setTransactionMode] = useState(TransactionMode.BUY);

  const [[tickerSymbol, targetAllocation, editingTicker, submittedTicker], setInputs] = useState<
    [string, string, boolean, boolean]
  >(["", "0", true, false]);
  const [[assetPrice, marketValue, currentAllocation], setFixedValues] = useState([0, 0, 0]);

  const [sharesMode, toggleSharesMode] = useState(true);
  const [[shares, costBasis], setTxnQuantities] = useState([0, 0]);

  const [transactionQueue, settransactionQueue] = useState<Transaction[]>(props.transactionQueue);

  const getStockQuote = useCallback(
    async (asset: AssetData | undefined, ev?: FormEvent) => {
      ev?.preventDefault();

      const price = tickerSymbol ? (await window.electronAPI.getStockQuote(tickerSymbol))[tickerSymbol] : 0;
      const newMarketValue = asset ? asset.marketValue : 0;
      const newCurrentAllocation = asset ? asset.allocation : 0;

      setInputs([
        tickerSymbol,
        targetAllocation !== "0" ? targetAllocation : newCurrentAllocation.toFixed(2),
        editingTicker,
        false,
      ]);
      setFixedValues([price, newMarketValue, newCurrentAllocation]);
    },
    [editingTicker, targetAllocation, tickerSymbol]
  );

  useEffect(() => {
    if (!isInitialLoad) {
      return;
    }

    const transactionDataJSON = window.localStorage.getItem("transactionData");

    if (!transactionDataJSON) {
      return;
    }

    const transactionData: Transaction = JSON.parse(transactionDataJSON);

    setTransactionMode(transactionData.transactionMode);
    setInputs([transactionData.tickerSymbol, targetAllocation, false, true]);
    setTxnQuantities([transactionData.shares, transactionData.costBasis]);

    toggleInitialLoad(!isInitialLoad);
  }, [getStockQuote, isInitialLoad]);

  useEffect(() => {
    window.localStorage.setItem(
      "transactionData",
      JSON.stringify({
        transactionMode,
        tickerSymbol,
        targetAllocation,
        shares,
        costBasis,
      })
    );
  }, [targetAllocation, costBasis, shares, tickerSymbol, transactionMode]);

  useEffect(() => {
    if (submittedTicker) {
      getStockQuote(_.find(props.assets, ["symbol", tickerSymbol]));
    }

    if (tickerSymbol && targetAllocation && Number(targetAllocation) > 0) {
      const decimalAllocation = Number(targetAllocation) / 100;

      const newCostBasis = decimalAllocation * totalPortfolioValue - marketValue;
      const newShares = costBasis / assetPrice;

      setTxnQuantities([Math.abs(Number(newShares.toFixed(6))), Math.abs(Number(newCostBasis.toFixed(2)))]);
    }
  }, [
    submittedTicker,
    props.assets,
    tickerSymbol,
    assetPrice,
    getStockQuote,
    totalPortfolioValue,
    marketValue,
    targetAllocation,
    costBasis,
  ]);

  const [invalidAllocation, toggleInvalidAllocation] = useState(false);
  useEffect(() => {
    if (editingTicker) {
      toggleInvalidAllocation(false);
      return;
    }

    const isValidBuy = transactionMode === TransactionMode.BUY && Number(targetAllocation) <= currentAllocation;
    const isValidSell = transactionMode === TransactionMode.SELL && Number(targetAllocation) >= currentAllocation;
    toggleInvalidAllocation(isValidBuy || isValidSell);
  }, [transactionMode, currentAllocation, editingTicker, targetAllocation]);

  const reset = () => {
    setInputs(["", "0", true, false]);
    setFixedValues([0, 0, 0]);
    setTxnQuantities([0, 0]);
  };

  const appendTxn = async () => {
    const newtransactionQueue = await window.electronAPI.updateTransaction(props.portfolioSlug, {
      transactionMode,
      tickerSymbol,
      targetAllocation: Number(targetAllocation),
      shares,
      costBasis,
    });
    settransactionQueue(newtransactionQueue);
    reset();
  };

  const removeTxn = async (symbol: string, updateAsset: boolean) => {
    const newtransactionQueue = await window.electronAPI.deleteTransaction(props.portfolioSlug, symbol, updateAsset);
    settransactionQueue(newtransactionQueue);
  };

  return (
    <div className="grid grid-cols-2 mx-auto mt-6">
      <div className="w-3/4 flex flex-col items-center space-y-10 mx-auto">
        <div className="w-full flex flex-col items-center border border-neutral-700 rounded-lg">
          <h2 className="text-2xl font-semibold rounded-t-xl px-4 py-3">Total Portfolio Value</h2>
          <div className="flex justify-center items-center text-2xl font-medium py-4">
            <FiDollarSign size={22} />
            <p>{totalPortfolioValue.toFixed(2)}</p>
          </div>
        </div>
        <CalculatorGrid
          {...{
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
                  {sharesMode ? <FiPieChart size={20} /> : <FiDollarSign size={20} />}
                </div>
                <span>{sharesMode ? "SHARES" : "COST BASIS"}</span>
              </button>
            }
          >
            <NumberCell
              type={sharesMode ? "plain" : "dollar"}
              value={sharesMode ? shares : costBasis}
              transactionMode={transactionMode}
            />
          </CalculatorRow>
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
          >
            <button
              type="button"
              className="flex items-center bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-neutral-400 transition duration-100 ease-in rounded-full space-x-2 px-8 py-2"
              onClick={() => appendTxn()}
              disabled={
                !_.every([tickerSymbol, targetAllocation, shares, costBasis, !editingTicker]) ||
                invalidAllocation ||
                Boolean(_.find(transactionQueue, ["symbol", tickerSymbol]))
              }
            >
              <FiPlusCircle size={24} />
              <span>Queue</span>
            </button>
          </CalculatorRow>
        </Grid>
      </div>
      <div className="h-full flex justify-center">
        <div className="w-3/4 flex flex-col items-center border border-neutral-700 rounded-lg space-y-4">
          <div className="w-full h-min bg-orange-500 rounded-t-lg border-b border-neutral-700">
            <h2 className="text-2xl font-semibold text-center p-4">Transaction Queue</h2>
          </div>
          <div className="w-full grid grid-cols-5 text-xl font-medium gap-y-4 px-4">
            <div />
            <HeadingLabel>Symbol</HeadingLabel>
            <HeadingLabel>Target Allocation</HeadingLabel>
            <HeadingLabel>Shares</HeadingLabel>
            <HeadingLabel>Cost Basis</HeadingLabel>
            {transactionQueue.map(
              ({ transactionMode, tickerSymbol, targetAllocation, shares: txnShares, costBasis: txnCostBasis }) => (
                <Fragment key={tickerSymbol}>
                  <div className="w-full flex justify-start items-center space-x-4 pl-2">
                    <button
                      type="button"
                      className="hover:bg-blue-500 border-2 border-blue-500 transition duration-100 ease-in rounded-full p-1"
                      onClick={() => {
                        removeTxn(tickerSymbol, true);
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
                        removeTxn(tickerSymbol, false);
                      }}
                    >
                      <FiX size={20} className="text-neutral-300 hover:text-white transition duration-100 ease-in" />
                    </button>
                  </div>
                  <TxnCell transactionMode={transactionMode}>{tickerSymbol}</TxnCell>
                  <TxnCell transactionMode={transactionMode}>
                    <NumberCell type="percent" value={targetAllocation} />
                  </TxnCell>
                  <TxnCell transactionMode={transactionMode}>
                    <NumberCell type="plain" value={txnShares} transactionMode={transactionMode} />
                  </TxnCell>
                  <TxnCell transactionMode={transactionMode}>
                    <NumberCell type="dollar" value={txnCostBasis} transactionMode={transactionMode} />
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
