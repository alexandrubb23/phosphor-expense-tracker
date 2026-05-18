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

export default function SpendingByCategoryMobileChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={data.length * 36 + 16}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 48, left: 0, bottom: 4 }}
        barCategoryGap="24%"
        className="[&_*:focus]:outline-none"
      >
        <CartesianGrid
          horizontal={false}
          stroke={Palette.Hairline}
          strokeDasharray="2 6"
        />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9 }}
          tickFormatter={(v: number) => formatCurrency(v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9 }}
          tickFormatter={(v: string) => v.toUpperCase()}
          width={88}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "var(--accent-glow-08)" }}
        />
        <Bar
          dataKey="value"
          radius={[0, 0, 0, 0]}
          maxBarSize={24}
          shape={barShape}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
