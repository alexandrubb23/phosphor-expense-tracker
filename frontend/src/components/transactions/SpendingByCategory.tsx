import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CATEGORY_COLORS, CATEGORY_COLOR_FALLBACK } from "../../categoryColors";
import { useTransactionSummary } from "../../hooks/useTransactions";
import { useSummaryPeriod } from "../../context/SummaryPeriodContext";

interface ChartEntry {
  name: string;
  value: number;
}

interface TooltipPayloadItem {
  value: number;
  payload: ChartEntry;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="relative border border-cyan-dim bg-bg px-4 py-3 font-mono text-xs text-ink shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(0,229,255,0.08)]">
      <span className="absolute -top-px -left-px h-1.5 w-1.5 bg-cyan" />
      <div className="mb-1.5 text-[9px] uppercase tracking-[0.22em] text-muted">
        ▸ {entry.payload.name}
      </div>
      <div className="text-[15px] font-medium text-cyan">
        ${entry.value.toLocaleString()}
      </div>
    </div>
  );
}

function SpendingByCategory() {
  const { query } = useSummaryPeriod();
  const { data: summary } = useTransactionSummary(query);
  const data: ChartEntry[] = (summary?.byCategory ?? []).map((c) => ({
    name: c.category,
    value: c.total,
  }));

  return (
    <div className="relative border border-hairline bg-panel px-6 pt-6 pb-2">
      <span className="pointer-events-none absolute -top-px -left-px h-2.5 w-2.5 border border-cyan-dim border-r-0 border-b-0" />
      <span className="pointer-events-none absolute -right-px -bottom-px h-2.5 w-2.5 border border-cyan-dim border-l-0 border-t-0" />
      {data.length === 0 ? (
        <p className="py-10 text-center font-mono text-[13px] uppercase tracking-widest text-muted">
          [_] NO SIGNAL · STANDBY [_]
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 12, left: 0, bottom: 8 }}
            barCategoryGap="32%"
          >
            <CartesianGrid
              vertical={false}
              stroke="#1a2535"
              strokeDasharray="2 6"
            />
            <XAxis
              dataKey="name"
              axisLine={{ stroke: "#2a4055", strokeWidth: 1 }}
              tickLine={false}
              tick={{ dy: 12 }}
              tickFormatter={(v: string) => v.toUpperCase()}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ dx: -4 }}
              tickFormatter={(v: number) => `$${v}`}
              width={60}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(0, 229, 255, 0.05)" }}
            />
            <Bar dataKey="value" radius={[0, 0, 0, 0]} maxBarSize={64}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={
                    CATEGORY_COLORS[entry.name] ??
                    CATEGORY_COLOR_FALLBACK[
                      index % CATEGORY_COLOR_FALLBACK.length
                    ]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SpendingByCategory;
