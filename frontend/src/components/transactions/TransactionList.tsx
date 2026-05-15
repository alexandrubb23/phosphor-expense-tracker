import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type OnChangeFn,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  OperationType,
  TransactionStatus,
  SortDir,
} from "@expense-tracker/core";
import { Transaction } from "../../api/transactions";
import { CATEGORY_COLORS } from "../../categoryColors";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
}

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-w-40">
      <select
        value={value}
        className="w-full cursor-pointer appearance-none border border-hairline-glow bg-panel px-3.5 py-1.5 pr-7 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-colors duration-200 hover:border-cyan-dim focus:outline-none"
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-cyan">
        ⌄
      </span>
    </div>
  );
}

function SortIcon({ isSorted }: { isSorted: false | SortDir }) {
  if (isSorted === SortDir.asc)
    return <span className="ml-1.5 text-cyan">▲</span>;
  if (isSorted === SortDir.desc)
    return <span className="ml-1.5 text-cyan">▼</span>;
  return <span className="ml-1.5 text-muted opacity-40">⇅</span>;
}

const columnHelper = createColumnHelper<Transaction>();

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const shortId = (id: string) => `TX-${id.slice(-4).toUpperCase()}`;
const formatDate = (iso: string) => iso.slice(0, 10);

function TransactionList({
  transactions,
  onDelete,
  sorting = [{ id: "date", desc: true }],
  onSortingChange = () => {},
}: TransactionListProps) {
  const [filterType, setFilterType] = useState<"all" | OperationType>("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm(`Delete "${transaction.description}"?`)) {
      onDelete(transaction.id);
    }
  };

  let filtered = transactions;
  if (filterType === OperationType.Inflow)
    filtered = filtered.filter((t) => t.operationType === OperationType.Inflow);
  if (filterType === OperationType.Outflow)
    filtered = filtered.filter(
      (t) => t.operationType === OperationType.Outflow
    );
  if (filterCategory !== "all")
    filtered = filtered.filter((t) => t.category === filterCategory);

  const categories = [...new Set(transactions.map((t) => t.category))].sort();

  const columns = [
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
      cell: (info) => formatDate(info.getValue()),
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
              style={{ background: CATEGORY_COLORS[cat] ?? "#5a7080" }}
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
      header: "",
      enableSorting: false,
      cell: (info) => {
        const t = info.row.original;
        const isPending = t.status === TransactionStatus.Pending;
        return isPending ? (
          <button
            className="inline-flex h-6.5 w-6.5 items-center justify-center border border-hairline-glow bg-transparent font-mono text-sm leading-none text-muted transition-all duration-200 hover:border-red hover:bg-red hover:text-bg-deep hover:shadow-[0_0_16px_rgba(255,58,92,0.5)]"
            onClick={() => handleDelete(t)}
            aria-label={`Delete ${t.description}`}
            title="Purge"
          >
            ×
          </button>
        ) : null;
      },
    }),
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-7 border border-hairline bg-surface px-4.5 py-3.5 font-mono">
        <span className="text-[10px] uppercase tracking-[0.28em] text-cyan">
          ▸ FILTER
        </span>
        <FilterSelect
          value={filterType}
          onChange={(value) => setFilterType(value as "all" | OperationType)}
        >
          <option value="all" className="bg-panel-raised">
            All Flows
          </option>
          <option value={OperationType.Inflow} className="bg-panel-raised">
            Inflow
          </option>
          <option value={OperationType.Outflow} className="bg-panel-raised">
            Outflow
          </option>
        </FilterSelect>
        <FilterSelect value={filterCategory} onChange={setFilterCategory}>
          <option value="all" className="bg-panel-raised">
            All Categories
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-panel-raised">
              {cat}
            </option>
          ))}
        </FilterSelect>
      </div>

      {table.getRowModel().rows.length === 0 ? (
        <p className="border border-hairline bg-panel py-12 text-center font-mono text-[13px] uppercase tracking-widest text-muted">
          [_] NO RECORDS FOUND · STANDBY [_]
        </p>
      ) : (
        <table className="w-full border-collapse border border-hairline bg-panel">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-cyan-dim bg-surface"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const isAmountCol = header.column.id === "amount";
                  const isStatusCol = header.column.id === "status";
                  const isIdCol = header.column.id === "id";
                  const isActionsCol = header.column.id === "actions";
                  return (
                    <th
                      key={header.id}
                      className={[
                        "px-4.5 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan",
                        isAmountCol || isActionsCol
                          ? "text-right"
                          : "text-left",
                        isStatusCol || isIdCol ? "max-sm:hidden" : "",
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
                    return (
                      <td
                        key={cell.id}
                        className={[
                          "px-4.5 py-4 align-middle",
                          isIdCol
                            ? "w-22.5 font-mono text-[11px] tracking-[0.04em] text-muted max-sm:hidden"
                            : "",
                          isDateCol
                            ? "w-27.5 font-mono text-[11px] tracking-[0.06em] text-ink-soft"
                            : "",
                          cell.column.id === "description"
                            ? "font-body text-sm font-normal text-ink"
                            : "",
                          isCategoryCol
                            ? "font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft max-sm:hidden"
                            : "",
                          isStatusCol
                            ? "font-mono text-[10px] uppercase tracking-[0.18em] max-sm:hidden"
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
      )}
    </div>
  );
}

export default TransactionList;
