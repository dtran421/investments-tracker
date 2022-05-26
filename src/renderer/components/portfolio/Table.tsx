import { useMemo } from "react";
import {
    useTable,
    Column,
    CellProps,
    useFlexLayout,
    useSortBy
} from "react-table";

import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import { DefaultCell, NumberCell, AddCell } from "./Cells";

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
                        Footer: AddCell
                    },
                    {
                        Header: "Description",
                        accessor: "description",
                        Footer: ""
                    },
                    {
                        Header: "Sector",
                        accessor: "sector",
                        Footer: ""
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
                        Footer: "",
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
                                    editable
                                    {...{ symbol, field }}
                                />
                            );
                        }
                    },
                    {
                        Header: "Gain/Loss $",
                        accessor: "dollarGain",
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
                        Header: "Gain/Loss %",
                        accessor: "percentGain",
                        Footer: "",
                        Cell: ({
                            row: { index },
                            value
                        }: CellProps<AssetData, number>) => (
                            <NumberCell
                                type="percent"
                                amount={value}
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
                        )
                    }
                ]
            }
        ],
        [assetData.length]
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
        <div className="w-full">
            <table {...getTableProps()} className="space-y-2">
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
                                        className="flex justify-center items-center space-x-2 m-2"
                                    >
                                        <h2 className="text-xl font-normal">
                                            {column.render("Header")}
                                        </h2>
                                        {column.isSorted ? sortIcon : null}
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
                                className="hover:bg-neutral-700/50 rounded-lg space-x-2 my-4"
                            >
                                {row.cells.map((cell) => {
                                    return (
                                        <td
                                            {...cell.getCellProps()}
                                            className="h-20 flex justify-center items-center"
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
        </div>
    );
};

export default Table;
