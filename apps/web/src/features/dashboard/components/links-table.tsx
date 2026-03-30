"use client";

import { useMemo } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { createLinksTableColumns } from "@/features/dashboard/components/links-table.columns";
import type {
    LinksTableActions,
    LinksTableState,
} from "@/features/dashboard/components/links-table.types";

type LinksTableProps = {
    state: LinksTableState;
    actions: LinksTableActions;
};

export function LinksTable({ state, actions }: LinksTableProps) {
    const columns = useMemo(
        () =>
            createLinksTableColumns({
                actions: {
                    onCopy: actions.onCopy,
                    onToggle: actions.onToggle,
                },
                copiedLinkId: state.copiedLinkId,
                shortBaseUrl: state.shortBaseUrl,
                togglingLinkId: state.togglingLinkId,
            }),
        [
            actions.onCopy,
            actions.onToggle,
            state.copiedLinkId,
            state.shortBaseUrl,
            state.togglingLinkId,
        ],
    );

    const table = useReactTable({
        data: state.links,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-4">
            <div className="px-4 pb-1 sm:px-6">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="border-border/70"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {state.isLoading ? (
                            <TableRow>
                                <TableCell
                                    className="py-8 text-center text-muted-foreground"
                                    colSpan={5}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        Loading links...
                                    </span>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    className="py-8 text-center text-muted-foreground"
                                    colSpan={5}
                                >
                                    No links found yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-border/70"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={
                                                cell.column.id === "originalUrl"
                                                    ? "max-w-92"
                                                    : undefined
                                            }
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-4 py-4 sm:px-6">
                <p className="text-sm text-muted-foreground">
                    Showing {state.pagination.pageStart}-
                    {state.pagination.pageEnd} of {state.pagination.total}
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        disabled={
                            !state.pagination.canGoPrev ||
                            state.pagination.isRefreshingPage
                        }
                        onClick={actions.onPrevPage}
                        size="sm"
                        variant="outline"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                    </Button>

                    <span className="min-w-24 text-center text-sm text-muted-foreground">
                        Page {state.pagination.page} of{" "}
                        {state.pagination.totalPages}
                    </span>

                    <Button
                        disabled={
                            !state.pagination.canGoNext ||
                            state.pagination.isRefreshingPage
                        }
                        onClick={actions.onNextPage}
                        size="sm"
                        variant="outline"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
