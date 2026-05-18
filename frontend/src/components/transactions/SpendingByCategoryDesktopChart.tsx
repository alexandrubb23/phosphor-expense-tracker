import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  barShape,
  CustomTooltip,
  type ChartEntry,
} from "./spendingCategoryChartUtils";
import { formatCurrency } from "@/lib/currency";
import { Palette } from "@/lib/palette";

interface Props {
  data: ChartEntry[];
}

export default function SpendingByCategoryDesktopChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 12, left: 0, bottom: 8 }}
        barCategoryGap="32%"
        className="[&_*:focus]:outline-none"
      >
        <CartesianGrid
          vertical={false}
          stroke={Palette.Hairline}
          strokeDasharray="2 6"
        />
        <XAxis
          dataKey="name"
          axisLine={{ stroke: Palette.HairlineGlow, strokeWidth: 1 }}
          tickLine={false}
          interval={0}
          tick={{ dy: 6, fontSize: 9, angle: -35, textAnchor: "end" }}
          tickFormatter={(v: string) => v.toUpperCase()}
          height={60}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ dx: -4 }}
          tickFormatter={(v: number) => formatCurrency(v)}
          width={90}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "var(--accent-glow-08)" }}
        />
        <Bar
          dataKey="value"
          radius={[0, 0, 0, 0]}
          maxBarSize={64}
          shape={barShape}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
