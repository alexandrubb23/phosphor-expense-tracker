import type { TransactionFilter } from "@expense-tracker/core";

export type FilterSelectKey = keyof Omit<TransactionFilter, "search">;

interface FilterSelectProps {
  name: FilterSelectKey;
  value: string;
  children: React.ReactNode;
  onChange: (name: FilterSelectKey, value: string) => void;
}

export default function FilterSelect({
  name,
  value,
  children,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="relative min-w-40">
      <select
        value={value}
        className="w-full cursor-pointer appearance-none border border-hairline-glow bg-panel px-3.5 py-1.5 pr-7 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-colors duration-200 hover:border-cyan-dim focus:outline-none"
        onChange={(e) => onChange(name, e.target.value)}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-cyan">
        ⌄
      </span>
    </div>
  );
}
