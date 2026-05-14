import { useState } from "react";
import { Transaction } from "../../types";
import { CATEGORY_COLORS } from "../../categoryColors";

interface TransactionListProps {
  transactions: Transaction[];
  categories: string[];
  onDelete: (id: number) => void;
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

function TransactionList({
  transactions,
  categories,
  onDelete,
}: TransactionListProps) {
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [filterCategory, setFilterCategory] = useState("all");

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm(`Delete "${transaction.description}"?`)) {
      onDelete(transaction.id);
    }
  };

  let filtered = transactions;
  if (filterType !== "all")
    filtered = filtered.filter((t) => t.type === filterType);
  if (filterCategory !== "all")
    filtered = filtered.filter((t) => t.category === filterCategory);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const shortHash = (id: number) => {
    const hex = (id ^ 0xa3f5)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0")
      .slice(-4);
    return `TX-${hex}`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-7 border border-hairline bg-surface px-4.5 py-3.5 font-mono">
        <span className="text-[10px] uppercase tracking-[0.28em] text-cyan">
          ▸ FILTER
        </span>
        <FilterSelect
          value={filterType}
          onChange={(value) =>
            setFilterType(value as "all" | "income" | "expense")
          }
        >
          <option value="all" className="bg-panel-raised">
            All Flows
          </option>
          <option value="income" className="bg-panel-raised">
            Inflow
          </option>
          <option value="expense" className="bg-panel-raised">
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
            <th className="px-4.5 py-3.5 text-right font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
              DELTA
            </th>
            <th className="px-4.5 py-3.5 text-right font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t) => (
            <tr
              key={t.id}
              className="group relative border-b border-hairline transition-colors duration-200 hover:bg-panel-raised"
            >
              <td className="w-22.5 px-4.5 py-4 align-middle font-mono text-[11px] tracking-[0.04em] text-muted max-sm:hidden">
                {shortHash(t.id)}
              </td>
              <td className="w-27.5 px-4.5 py-4 align-middle font-mono text-[11px] tracking-[0.06em] text-ink-soft">
                {t.date}
              </td>
              <td className="px-4.5 py-4 align-middle font-body text-sm font-normal text-ink">
                {t.description}
              </td>
              <td className="px-4.5 py-4 align-middle font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft max-sm:hidden">
                <span className="inline-flex items-center gap-2 border border-hairline-glow bg-surface px-2.5 py-1 pl-2">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      background: CATEGORY_COLORS[t.category] ?? "#5a7080",
                    }}
                  />
                  {t.category}
                </span>
              </td>
              <td
                className={`whitespace-nowrap px-4.5 py-4 text-right align-middle font-mono text-sm font-medium tracking-[-0.005em] tabular-nums ${t.type === "income" ? "text-green" : "text-red"}`}
              >
                {t.type === "income" ? "+" : "−"}${fmt(t.amount)}
              </td>
              <td className="w-15 px-4.5 py-4 text-right align-middle">
                <button
                  className="inline-flex h-6.5 w-6.5 items-center justify-center border border-hairline-glow bg-transparent font-mono text-sm leading-none text-muted transition-all duration-200 hover:border-red hover:bg-red hover:text-bg-deep hover:shadow-[0_0_16px_rgba(255,58,92,0.5)]"
                  onClick={() => handleDelete(t)}
                  aria-label={`Delete ${t.description}`}
                  title="Purge"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;
