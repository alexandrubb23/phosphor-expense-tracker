import { useState } from "react";
import { OperationType, TransactionStatus } from "@expense-tracker/core";
import { Transaction } from "../../api/transactions";
import { CATEGORY_COLORS } from "../../categoryColors";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
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

function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const [filterType, setFilterType] = useState<"all" | OperationType>("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm(`Delete "${transaction.description}"?`)) {
      onDelete(transaction.id);
    }
  };

  let filtered = transactions;
  if (filterType === OperationType.Inflow)
    filtered = filtered.filter(
      (t) => t.operationType === OperationType.Inflow
    );
  if (filterType === OperationType.Outflow)
    filtered = filtered.filter(
      (t) => t.operationType === OperationType.Outflow
    );
  if (filterCategory !== "all")
    filtered = filtered.filter((t) => t.category === filterCategory);

  const categories = [...new Set(transactions.map((t) => t.category))].sort();

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const shortId = (id: string) => `TX-${id.slice(-4).toUpperCase()}`;

  const formatDate = (iso: string) => iso.slice(0, 10);

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

      {filtered.length === 0 ? (
        <p className="border border-hairline bg-panel py-12 text-center font-mono text-[13px] uppercase tracking-widest text-muted">
          [_] NO RECORDS FOUND · STANDBY [_]
        </p>
      ) : (
        <table className="w-full border-collapse border border-hairline bg-panel">
          <thead>
            <tr className="border-b border-cyan-dim bg-surface">
              <th className="px-4.5 py-3.5 text-left font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
                ID
              </th>
              <th className="px-4.5 py-3.5 text-left font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
                T·STAMP
              </th>
              <th className="px-4.5 py-3.5 text-left font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
                DESCRIPTOR
              </th>
              <th className="px-4.5 py-3.5 text-left font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
                CHANNEL
              </th>
              <th className="px-4.5 py-3.5 text-left font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan max-sm:hidden">
                STATUS
              </th>
              <th className="px-4.5 py-3.5 text-right font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
                DELTA
              </th>
              <th className="px-4.5 py-3.5 text-right font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const isInflow = t.operationType === OperationType.Inflow;
              const isPending = t.status === TransactionStatus.Pending;
              return (
                <tr
                  key={t.id}
                  className="group relative border-b border-hairline transition-colors duration-200 hover:bg-panel-raised"
                >
                  <td className="w-22.5 px-4.5 py-4 align-middle font-mono text-[11px] tracking-[0.04em] text-muted max-sm:hidden">
                    {shortId(t.id)}
                  </td>
                  <td className="w-27.5 px-4.5 py-4 align-middle font-mono text-[11px] tracking-[0.06em] text-ink-soft">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-4.5 py-4 align-middle font-body text-sm font-normal text-ink">
                    {t.description}
                  </td>
                  <td className="px-4.5 py-4 align-middle font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft max-sm:hidden">
                    <span className="inline-flex items-center gap-2 border border-hairline-glow bg-surface px-2.5 py-1 pl-2">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          background:
                            CATEGORY_COLORS[t.category] ?? "#5a7080",
                        }}
                      />
                      {t.category}
                    </span>
                  </td>
                  <td className="px-4.5 py-4 align-middle font-mono text-[10px] uppercase tracking-[0.18em] max-sm:hidden">
                    {isPending ? (
                      <span className="text-[#ffb84a]">PENDING</span>
                    ) : (
                      <span className="text-muted">CONFIRMED</span>
                    )}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4.5 py-4 text-right align-middle font-mono text-sm font-medium tracking-[-0.005em] tabular-nums ${isInflow ? "text-green" : "text-red"}`}
                  >
                    {isInflow ? "+" : "−"}
                    {fmt(Number(t.amount))} {t.currency}
                  </td>
                  <td className="w-15 px-4.5 py-4 text-right align-middle">
                    {isPending && (
                      <button
                        className="inline-flex h-6.5 w-6.5 items-center justify-center border border-hairline-glow bg-transparent font-mono text-sm leading-none text-muted transition-all duration-200 hover:border-red hover:bg-red hover:text-bg-deep hover:shadow-[0_0_16px_rgba(255,58,92,0.5)]"
                        onClick={() => handleDelete(t)}
                        aria-label={`Delete ${t.description}`}
                        title="Purge"
                      >
                        ×
                      </button>
                    )}
                  </td>
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
