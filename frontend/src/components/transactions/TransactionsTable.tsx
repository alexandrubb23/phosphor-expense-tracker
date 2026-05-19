import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  TransactionStatus,
  OperationType,
  SortDir,
  type TransactionSortField,
} from "@expense-tracker/core";
import { useCallback, useMemo, useState } from "react";
import { CATEGORY_COLORS } from "../../categoryColors";
import { Palette } from "@/lib/palette";
import { Transaction } from "../../api/transactions";
import {
  useTransactions,
  useDeleteTransaction,
} from "../../hooks/useTransactions";
import { useTransactionsFilter } from "../../context/TransactionsFilterContext";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import EditTransactionModal from "./EditTransactionModal";
import RefetchButton from "../ui/RefetchButton";
import { formatTime, formatDateTime } from "@/lib/time";

function SortIcon({ isSorted }: { isSorted: false | SortDir }) {
  if (isSorted === SortDir.asc)
    return <span className="ml-1.5 text-purple">▲</span>;
  if (isSorted === SortDir.desc)
    return <span className="ml-1.5 text-purple">▼</span>;
  return <span className="ml-1.5 text-muted opacity-40">⇅</span>;
}

const columnHelper = createColumnHelper<Transaction>();
const coreRowModel = getCoreRowModel();

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const shortId = (id: string) => `TX-${id.slice(-4).toUpperCase()}`;

function TransactionsTable() {
  const { filter, pagination, setPagination } = useTransactionsFilter();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const sort = useMemo(
    () =>
      sorting[0]
        ? {
            sortBy: sorting[0].id as TransactionSortField,
            sortDir: sorting[0].desc ? SortDir.desc : SortDir.asc,
          }
        : undefined,
    [sorting]
  );

  const apiPagination = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }),
    [pagination]
  );

  const { data: result, refetch } = useTransactions(
    sort,
    filter,
    apiPagination
  );
  const transactions = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;
  const total = result?.total ?? 0;

  const { mutateAsync: deleteTransaction } = useDeleteTransaction();

  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [pendingEdit, setPendingEdit] = useState<Transaction | null>(null);

  const handleDelete = useCallback((transaction: Transaction) => {
    setPendingDelete(transaction);
  }, []);

  const handleEdit = useCallback((transaction: Transaction) => {
    setPendingEdit(transaction);
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        id: "id",
        header: "ID",
        enableSorting: false,
        cell: (info) => shortId(info.getValue()),
      }),
      columnHelper.accessor("date", {
        id: "date",
        header: "T·STAMP",
        enableSorting: true,
        cell: (info) => formatDateTime(new Date(info.getValue())),
      }),
      columnHelper.accessor("createdAt", {
        id: "createdAt",
        header: "T·IME",
        enableSorting: true,
        cell: (info) => formatTime(new Date(info.getValue())),
      }),
      columnHelper.accessor("description", {
        id: "description",
        header: "DESCRIPTOR",
        enableSorting: true,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("category", {
        id: "category",
        header: "CHANNEL",
        enableSorting: true,
        cell: (info) => {
          const cat = info.getValue();
          return (
            <span className="inline-flex items-center gap-2 border border-hairline-glow bg-surface px-2.5 py-1 pl-2">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: CATEGORY_COLORS[cat] ?? Palette.Muted }}
              />
              {cat}
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "STATUS",
        enableSorting: true,
        cell: (info) => {
          const isPending = info.getValue() === TransactionStatus.Pending;
          return isPending ? (
            <span className="text-amber">PENDING</span>
          ) : (
            <span className="text-muted">CONFIRMED</span>
          );
        },
      }),
      columnHelper.accessor("amount", {
        id: "amount",
        header: "DELTA",
        enableSorting: true,
        cell: (info) => {
          const t = info.row.original;
          const isInflow = t.operationType === OperationType.Inflow;
          return (
            <span
              className={`whitespace-nowrap font-mono text-sm font-medium tracking-[-0.005em] tabular-nums ${isInflow ? "text-green" : "text-red"}`}
            >
              {isInflow ? "+" : "−"}
              {fmt(Number(info.getValue()))} {t.currency}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <RefetchButton onClick={() => refetch()} />,
        enableSorting: false,
        cell: (info) => {
          const t = info.row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                className="inline-flex h-6.5 w-6.5 items-center justify-center border border-hairline-glow bg-transparent font-mono text-[13px] leading-none text-muted transition-all duration-200 hover:border-purple hover:bg-purple hover:text-bg-deep hover:shadow-[0_0_16px_var(--accent-glow-50)]"
                onClick={() => handleEdit(t)}
                aria-label={`Edit ${t.description}`}
                title="Edit"
              >
                ✎
              </button>
              <button
                className="inline-flex h-6.5 w-6.5 items-center justify-center border border-hairline-glow bg-transparent font-mono text-sm leading-none text-muted transition-all duration-200 hover:border-red hover:bg-red hover:text-bg-deep hover:shadow-[0_0_16px_rgba(255,58,92,0.5)]"
                onClick={() => handleDelete(t)}
                aria-label={`Delete ${t.description}`}
                title="Purge"
              >
                ×
              </button>
            </div>
          );
        },
      }),
    ],
    [handleDelete, handleEdit, refetch]
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualSorting: true,
    manualPagination: true,
    pageCount: totalPages,
    getCoreRowModel: coreRowModel,
  });

  return (
    <div>
      {table.getRowModel().rows.length === 0 ? (
        <p className="border border-hairline bg-panel py-12 text-center font-mono text-[13px] uppercase tracking-widest text-muted">
          [_] NO RECORDS FOUND · STANDBY [_]
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 border-collapse border border-hairline bg-panel">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-purple-dim bg-surface"
                  >
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();
                      const isAmountCol = header.column.id === "amount";
                      const isActionsCol = header.column.id === "actions";
                      return (
                        <th
                          key={header.id}
                          className={[
                            "px-4.5 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-purple",
                            isAmountCol || isActionsCol
                              ? "text-right"
                              : "text-left",
                            canSort
                              ? "cursor-pointer select-none hover:text-ink-soft"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={
                            canSort
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && <SortIcon isSorted={sorted} />}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  return (
                    <tr
                      key={row.id}
                      className="group relative border-b border-hairline transition-colors duration-200 hover:bg-panel-raised"
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isAmountCol = cell.column.id === "amount";
                        const isActionsCol = cell.column.id === "actions";
                        const isIdCol = cell.column.id === "id";
                        const isCategoryCol = cell.column.id === "category";
                        const isStatusCol = cell.column.id === "status";
                        const isDateCol = cell.column.id === "date";
                        const isCreatedAtCol = cell.column.id === "createdAt";
                        return (
                          <td
                            key={cell.id}
                            className={[
                              "px-4.5 py-4 align-middle",
                              isIdCol
                                ? "w-22.5 font-mono text-[11px] tracking-[0.04em] text-muted"
                                : "",
                              isDateCol
                                ? "w-27.5 font-mono text-[11px] tracking-[0.06em] text-ink-soft"
                                : "",
                              isCreatedAtCol
                                ? "w-32 font-mono text-[11px] tracking-[0.06em] text-ink-soft"
                                : "",
                              cell.column.id === "description"
                                ? "font-body text-sm font-normal text-ink"
                                : "",
                              isCategoryCol
                                ? "font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft"
                                : "",
                              isStatusCol
                                ? "font-mono text-[10px] uppercase tracking-[0.18em]"
                                : "",
                              isAmountCol ? "text-right" : "",
                              isActionsCol ? "w-15 text-right" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="mt-0 flex items-center justify-between border border-t-0 border-hairline bg-surface px-4.5 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              {total} record{total !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-3">
              <select
                value={pagination.pageSize}
                onChange={(e) =>
                  setPagination({
                    pageIndex: 0,
                    pageSize: Number(e.target.value),
                  })
                }
                className="cursor-pointer border border-hairline-glow bg-panel px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink focus:outline-none"
                aria-label="Rows per page"
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n} className="bg-panel-raised">
                    {n} / page
                  </option>
                ))}
              </select>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                {pagination.pageIndex + 1} / {totalPages}
              </span>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex h-7 w-7 items-center justify-center border border-hairline-glow bg-panel font-mono text-xs text-ink transition-colors hover:border-purple-dim hover:text-purple disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous page"
              >
                ‹
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex h-7 w-7 items-center justify-center border border-hairline-glow bg-panel font-mono text-xs text-ink transition-colors hover:border-purple-dim hover:text-purple disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}

      {pendingDelete && (
        <ConfirmDeleteModal
          title="Delete Transaction"
          entityName={pendingDelete.description}
          onConfirm={() => deleteTransaction(pendingDelete.id)}
          onClose={() => setPendingDelete(null)}
          fallbackError="Failed to delete transaction"
        />
      )}

      {pendingEdit && (
        <EditTransactionModal
          transaction={pendingEdit}
          onClose={() => setPendingEdit(null)}
        />
      )}
    </div>
  );
}

export default TransactionsTable;
