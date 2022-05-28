import { ReactNode, useMemo } from "react";
import {
    useTable,
    Column,
    CellProps,
    useFlexLayout,
    useSortBy
} from "react-table";
import _ from "lodash";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import { FiDollarSign, FiPercent } from "react-icons/fi";

import {
    DefaultCell,
    DeleteCell,
    NumberCell,
    SummaryCell,
    TextCell
} from "./Cells";
import { AddCell } from "./EditableCells";

import { AssetData } from "../../../../types";

interface TableProps {
    assetData: AssetData[];
}

const Table = ({ assetData }: TableProps) => {
    const stockColumns = useMemo<ReadonlyArray<Column<AssetData>>>(
        () => [
            {
                Header: <div />,
                id: "CompanyData",
                Footer: "",
                columns: [
                    {
                        Header: "Symbol",
                        accessor: "symbol",
                        Footer: AddCell,
                        width: 75
                    },
                    {
                        Header: "Description",
                        accessor: "description",
                        Footer: "",
                        Cell: ({
                            row: {
                                values: { symbol }
                            },
                            column: { id: field },
                            value
                        }: CellProps<AssetData, string>) => {
                            return (
                                <TextCell
                                    editable={symbol !== "Cash"}
                                    {...{ symbol, value, field }}
                                />
                            );
                        }
                    },
                    {
                        Header: "Sector",
                        accessor: "sector",
                        Footer: "",
                        Cell: ({
                            row: {
                                values: { symbol }
                            },
                            column: { id: field },
                            value
                        }: CellProps<AssetData, string>) => {
                            return (
                                <TextCell
                                    editable={symbol !== "Cash"}
                                    {...{ symbol, value, field }}
                                />
                            );
                        }
                    }
                ]
            },
            {
                Header: <div />,
                id: "StockData",
                Footer: "",
                columns: [
                    {
                        Header: "Quantity",
                        accessor: "quantity",
                        Footer: "",
                        Cell: ({
                            row: {
                                values: { symbol }
                            },
                            column: { id: field },
                            value
                        }: CellProps<AssetData, number>) => {
                            return (
                                <NumberCell
                                    type="plain"
                                    amount={value}
                                    editable
                                    {...{ symbol, field }}
                                />
                            );
                        }
                    },
                    {
                        Header: "Price",
                        accessor: "price",
                        Footer: "",
                        Cell: ({
                            row: { index },
                            value
                        }: CellProps<AssetData, number>) => (
                            <NumberCell
                                type="dollar"
                                amount={value}
                                lastRow={index === assetData.length - 1}
                            />
                        )
                    },
                    {
                        Header: "Market Value",
                        accessor: "marketValue",
                        Footer: ({
                            value: amount
                        }: CellProps<AssetData, number>) => (
                            <SummaryCell
                                type="dollar"
                                columnValues={_.map(
                                    assetData,
                                    ({ marketValue }) => marketValue
                                )}
                                {...{ amount }}
                            />
                        ),
                        Cell: ({ value }: CellProps<AssetData, number>) => (
                            <NumberCell type="dollar" amount={value} />
                        )
                    },
                    {
                        Header: "Cost Basis",
                        accessor: "costBasis",
                        Footer: "",
                        Cell: ({
                            row: {
                                values: { symbol }
                            },
                            column: { id: field },
                            value
                        }: CellProps<AssetData, number>) => {
                            return (
                                <NumberCell
                                    type="dollar"
                                    amount={value}
                                    editable={symbol !== "Cash"}
                                    {...{ symbol, field }}
                                />
                            );
                        }
                    },
                    {
                        Header: (
                            <div className="flex items-center text-lg text-center space-x-1 py-1">
                                <span>Gain/Loss</span>
                                <FiDollarSign size={18} />
                            </div>
                        ),
                        accessor: "dollarGain",
                        Footer: ({
                            value: amount
                        }: CellProps<AssetData, number>) => (
                            <SummaryCell
                                type="dollar"
                                showGain
                                columnValues={_.map(
                                    assetData,
                                    ({ dollarGain }) => dollarGain
                                )}
                                {...{ amount }}
                            />
                        ),
                        Cell: ({
                            row: { index },
                            value
                        }: CellProps<AssetData, number>) => (
                            <NumberCell
                                type="dollar"
                                amount={value}
                                showGain
                                lastRow={index === assetData.length - 1}
                            />
                        )
                    },
                    {
                        Header: (
                            <div className="flex items-center text-lg text-center space-x-1 py-1">
                                <span>Gain/Loss</span>
                                <FiPercent size={18} />
                            </div>
                        ),
                        accessor: "percentGain",
                        Footer: ({
                            value: amount
                        }: CellProps<AssetData, number>) => (
                            <SummaryCell
                                type="dollar"
                                columnValues={_.map(
                                    assetData,
                                    ({ percentGain }) => percentGain
                                )}
                                showGain
                                {...{ amount }}
                            />
                        ),
                        Cell: ({
                            row: { index },
                            value
                        }: CellProps<AssetData, number>) => (
                            <NumberCell
                                type="percent"
                                amount={value}
                                showGain
                                lastRow={index === assetData.length - 1}
                            />
                        )
                    },
                    {
                        Header: "Allocation",
                        accessor: "allocation",
                        Footer: "",
                        Cell: ({ value }: CellProps<AssetData, number>) => (
                            <NumberCell type="percent" amount={value} />
                        ),
                        width: 100
                    }
                ]
            },
            {
                Header: "",
                id: "delete",
                Cell: ({
                    row: {
                        values: { symbol }
                    }
                }: CellProps<AssetData, ReactNode>) => (
                    <DeleteCell {...{ symbol }} />
                ),
                width: 50
            }
        ],
        [assetData]
    );

    const defaultColumn = {
        Cell: DefaultCell,
        minWidth: 30,
        width: 125,
        maxWidth: 200
    };

    const holdingsTable = useTable<AssetData>(
        {
            columns: stockColumns,
            data: assetData,
            defaultColumn
        },
        useSortBy,
        useFlexLayout
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        footerGroups,
        rows,
        prepareRow
    } = holdingsTable;

    return (
        <table {...getTableProps()} className="w-full">
            <thead>
                {headerGroups.map((headerGroup) => (
                    <tr
                        {...headerGroup.getHeaderGroupProps()}
                        className="border-b-2 border-neutral-700"
                    >
                        {headerGroup.headers.map((column) => {
                            const sortIcon = column.isSortedDesc ? (
                                <AiFillCaretDown size={18} />
                            ) : (
                                <AiFillCaretUp size={18} />
                            );

                            return (
                                <th
                                    {...column.getHeaderProps(
                                        column.getSortByToggleProps()
                                    )}
                                    className="flex justify-center items-center space-x-2 my-2"
                                >
                                    <h2 className="text-xl font-normal select-none">
                                        {column.render("Header")}
                                    </h2>
                                    {column.isSorted ? (
                                        <div className="text-orange-500">
                                            {sortIcon}
                                        </div>
                                    ) : null}
                                </th>
                            );
                        })}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row);
                    return (
                        <tr
                            {...row.getRowProps()}
                            className="hover:bg-neutral-700/50 rounded-lg space-x-2"
                        >
                            {row.cells.map((cell) => {
                                return (
                                    <td
                                        {...cell.getCellProps()}
                                        className="flex justify-center items-center"
                                    >
                                        {cell.render("Cell")}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
            <tfoot>
                {footerGroups.map((group) => (
                    <tr {...group.getFooterGroupProps()}>
                        {group.headers.map((column) => (
                            <td {...column.getFooterProps()}>
                                {column.render("Footer")}
                            </td>
                        ))}
                    </tr>
                ))}
            </tfoot>
        </table>
    );
};

export default Table;
