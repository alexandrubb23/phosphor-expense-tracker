import { useCountUp } from "../../hooks/useCountUp";
import { useTransactionSummary } from "../../hooks/useTransactions";
import { useSummaryPeriod } from "../../context/SummaryPeriodContext";
import currency from "../../lib/currency";

function Summary() {
  const { query } = useSummaryPeriod();
  const { data } = useTransactionSummary(query);
  const totalIncome = data?.totalInflow ?? 0;
  const totalExpenses = data?.totalOutflow ?? 0;
  const balance = totalIncome - totalExpenses;
  const isNegative = balance < 0;

  const animatedBalance = useCountUp(Math.abs(balance));
  const animatedIncome = useCountUp(totalIncome);
  const animatedExpenses = useCountUp(totalExpenses);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <section className="mb-18 opacity-0 animate-fade-up [animation-delay:0.2s]">
      <div className="relative border border-hairline-glow bg-panel bg-linear-to-b from-[rgba(0,229,255,0.02)] to-transparent px-12 py-11 max-sm:px-5.5 max-sm:py-7">
        <span className="pointer-events-none absolute -top-0.5 -left-0.5 h-4.5 w-4.5 border-2 border-cyan border-r-0 border-b-0" />
        <span className="pointer-events-none absolute -top-0.5 -right-0.5 h-4.5 w-4.5 border-2 border-cyan border-l-0 border-b-0" />
        <span className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-4.5 w-4.5 border-2 border-cyan border-r-0 border-t-0" />
        <span className="pointer-events-none absolute -right-0.5 -bottom-0.5 h-4.5 w-4.5 border-2 border-cyan border-l-0 border-t-0" />

        <div className="mb-7 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em]">
          <span className="flex items-center gap-2.5 text-cyan">
            <span className="text-[12px]">▸</span>
            {isNegative ? "NET / DEFICIT" : "NET / POSITION"}
          </span>
          <span className="text-muted">
            CH·01 <span className="text-ink-soft">// REAL-TIME</span>
          </span>
        </div>

        <div className="relative overflow-hidden py-2 pb-4">
          <span
            className="pointer-events-none absolute inset-0 animate-scan mix-blend-screen"
            style={{
              backgroundImage:
                "linear-gradient(180deg, transparent 0%, transparent 45%, rgba(0,229,255,0.18) 50%, transparent 55%, transparent 100%)",
            }}
          />
          <div
            className={`flex items-start gap-[0.04em] font-display text-[clamp(64px,12.5vw,156px)] font-medium leading-[0.95] tracking-[-0.04em] tabular-nums ${isNegative ? "text-red" : "text-ink"}`}
          >
            <span
              className={`mt-[0.22em] text-[0.42em] font-normal ${isNegative ? "text-red" : "text-cyan"}`}
            >
              {isNegative ? `−${currency}` : currency}
            </span>
            {fmt(animatedBalance)}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-px border-t border-cyan-dim bg-hairline max-sm:grid-cols-1">
          <div className="relative flex flex-col gap-2.5 bg-panel px-5.5 py-5">
            <span className="absolute top-3.5 right-4.5 font-mono text-[9px] tracking-[0.24em] text-muted">
              CH·02
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
              Inflow
            </span>
            <span className="inline-flex items-baseline gap-2.5 font-mono text-2xl font-medium tracking-[-0.02em] text-green tabular-nums">
              <span className="text-[0.85em] opacity-85">▲</span>
              {currency}
              {fmt(animatedIncome)}
            </span>
          </div>
          <div className="relative flex flex-col gap-2.5 bg-panel px-5.5 py-5">
            <span className="absolute top-3.5 right-4.5 font-mono text-[9px] tracking-[0.24em] text-muted">
              CH·03
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
              Outflow
            </span>
            <span className="inline-flex items-baseline gap-2.5 font-mono text-2xl font-medium tracking-[-0.02em] text-red tabular-nums">
              <span className="text-[0.85em] opacity-85">▼</span>
              {currency}
              {fmt(animatedExpenses)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Summary;
