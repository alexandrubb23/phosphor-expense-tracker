import { useTransactionSummary } from "../../hooks/useTransactions";
import { useSummaryPeriod } from "../../context/SummaryPeriodContext";
import { useCountUp } from "../../hooks/useCountUp";

function formatDuration(ms: number): string {
  if (ms <= 0) return "—";
  if (ms < 1_000) return "< 1s";
  const totalSecs = Math.round(ms / 1_000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

interface MetricTileProps {
  channel: string;
  label: string;
  value: string;
  accent?: "cyan" | "green" | "red" | "muted";
}

function MetricTile({
  channel,
  label,
  value,
  accent = "cyan",
}: MetricTileProps) {
  const colorMap = {
    cyan: "text-cyan",
    green: "text-green",
    red: "text-red",
    muted: "text-muted",
  };

  return (
    <div className="relative flex flex-col gap-2 bg-panel px-5 py-4">
      <span className="absolute top-3 right-4 font-mono text-[9px] tracking-[0.24em] text-muted">
        {channel}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
        {label}
      </span>
      <span
        className={`font-mono text-xl font-medium tabular-nums ${colorMap[accent]}`}
      >
        {value}
      </span>
    </div>
  );
}

function MetricsBar() {
  const { query } = useSummaryPeriod();
  const { data } = useTransactionSummary(query);

  const totalCount = data?.totalCount ?? 0;
  const inflowCount = data?.inflowCount ?? 0;
  const outflowCount = data?.outflowCount ?? 0;
  const aiResolvedCount = data?.aiResolvedCount ?? 0;
  const aiResolvedPercent = data?.aiResolvedPercent ?? 0;
  const avgResolutionMs = data?.avgResolutionMs ?? 0;

  const animatedTotal = useCountUp(totalCount);
  const animatedInflow = useCountUp(inflowCount);
  const animatedOutflow = useCountUp(outflowCount);
  const animatedAi = useCountUp(aiResolvedCount);
  const animatedPercent = useCountUp(aiResolvedPercent);

  return (
    <div className="mb-6 grid grid-cols-3 gap-px border border-hairline bg-hairline max-sm:grid-cols-2">
      <MetricTile
        channel="M·01"
        label="Total Transactions"
        value={Math.round(animatedTotal).toLocaleString()}
        accent="cyan"
      />
      <MetricTile
        channel="M·02"
        label="Income Transactions"
        value={Math.round(animatedInflow).toLocaleString()}
        accent="green"
      />
      <MetricTile
        channel="M·03"
        label="Outcome Transactions"
        value={Math.round(animatedOutflow).toLocaleString()}
        accent="red"
      />
      <MetricTile
        channel="M·04"
        label="Resolved by AI"
        value={Math.round(animatedAi).toLocaleString()}
        accent="cyan"
      />
      <MetricTile
        channel="M·05"
        label="AI Resolution Rate"
        value={`${Math.round(animatedPercent)}%`}
        accent="cyan"
      />
      <MetricTile
        channel="M·06"
        label="Avg Resolution Time"
        value={formatDuration(avgResolutionMs)}
        accent="muted"
      />
    </div>
  );
}

export default MetricsBar;
