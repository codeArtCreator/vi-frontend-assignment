"use client";
import { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    Row,
} from "@tanstack/react-table";
import { DataTablePagination } from "./data-table-pagination";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const [selectedRow, setSelectedRow] = useState<string | null>(null);

    const enhancedColumns = [
        {
            id: 'select',
            accessorKey: 'select',
            header: () => 'Select',
            cell: ({ row }: { row: Row<TData> }) => (
                <Checkbox
                    checked={row.id === selectedRow}
                    onCheckedChange={() => setSelectedRow(row.id === selectedRow ? null : row.id)}
                />
            ),
            size: 20,
            enableResizing: true,
            sticky: 'left',
        },
        ...columns.map(column => ({
            ...column,
            enableResizing: true,
        })),
    ];

    const table = useReactTable({
        data,
        columns: enhancedColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            rowSelection: selectedRow ? { [selectedRow]: true } : {},
        },
        columnResizeMode: 'onChange',
        defaultColumn: {
            size: 50,
            minSize: 100,
            maxSize: 500,
        },
    });

    const columnSizeVars = useMemo(() => {
        const headers = table.getFlatHeaders();
        const colSizes: { [key: string]: number } = {};
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i]!;
            colSizes[`--header-${header.id}-size`] = header.getSize();
            colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
        }
        return colSizes;
    }, [table.getState().columnSizingInfo]);


    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table style={{ ...columnSizeVars, width: table.getTotalSize() }}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header, index) => (
                                    <TableHead key={header.id} colSpan={header.colSpan} style={{
                                        position: index < 2 ? 'sticky' : undefined,
                                        left: index === 0 ? 0 : index === 1 ? '50px' : undefined,
                                        zIndex: 1,
                                        background: '#fff',
                                        width: `calc(var(--header-${header.id}-size) * 1px)`,
                                    }}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                        <div
                                            onMouseDown={header.getResizeHandler()}
                                            onTouchStart={header.getResizeHandler()}
                                            className={`absolute right-0 top-0 bottom-0 w-1 z-10 hover:bg-gray-500 text-red-500 cursor-col-resize ${header.column.getIsResizing() ? 'isResizing' : ''
                                                }`}
                                        />
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell, index) => (
                                        <TableCell key={cell.id} style={{
                                            background: '#fff',
                                            position: index < 2 ? 'sticky' : undefined,
                                            left: index === 0 ? 0 : index === 1 ? '50px' : undefined,
                                        }}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    );
}

