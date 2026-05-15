import {
  SummaryPeriod,
  SUMMARY_PERIODS,
  useSummaryPeriod,
} from "../../context/SummaryPeriodContext";

const PERIOD_LABELS: Record<SummaryPeriod, string> = {
  [SummaryPeriod.today]: "TODAY",
  [SummaryPeriod.week]: "WEEK",
  [SummaryPeriod.month]: "MONTH",
  [SummaryPeriod.year]: "YEAR",
  [SummaryPeriod.custom]: "CUSTOM",
};

export default function SummaryPeriodSelector() {
  const { period, from, to, setPeriod, setFrom, setTo } = useSummaryPeriod();

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 border border-hairline bg-surface px-4.5 py-3 font-mono">
      <span className="text-[10px] uppercase tracking-[0.28em] text-cyan">
        ▸ PERIOD
      </span>
      <div className="flex flex-wrap gap-1.5">
        {SUMMARY_PERIODS.map((p) => {
          const active = period === p;
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                "px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-150",
                active
                  ? "border border-cyan bg-surface text-cyan"
                  : "border border-hairline-glow bg-panel text-muted hover:border-cyan-dim hover:text-ink",
              ].join(" ")}
            >
              {PERIOD_LABELS[p]}
            </button>
          );
        })}
      </div>

      {period === SummaryPeriod.custom && (
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="date"
            value={from ?? ""}
            onChange={(e) => setFrom(e.target.value || undefined)}
            className="border border-hairline-glow bg-panel px-3 py-1 font-mono text-[11px] tracking-[0.06em] text-ink focus:border-cyan-dim focus:outline-none"
            aria-label="From date"
          />
          <span className="text-[10px] tracking-[0.2em] text-muted">→</span>
          <input
            type="date"
            value={to ?? ""}
            onChange={(e) => setTo(e.target.value || undefined)}
            className="border border-hairline-glow bg-panel px-3 py-1 font-mono text-[11px] tracking-[0.06em] text-ink focus:border-cyan-dim focus:outline-none"
            aria-label="To date"
          />
        </div>
      )}
    </div>
  );
}
