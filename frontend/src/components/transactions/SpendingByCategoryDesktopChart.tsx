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
import currency from "../../lib/currency";

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
          stroke="#1a2535"
          strokeDasharray="2 6"
        />
        <XAxis
          dataKey="name"
          axisLine={{ stroke: "#2a4055", strokeWidth: 1 }}
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
          tickFormatter={(v: number) => `${currency}${v}`}
          width={60}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(0, 229, 255, 0.05)" }}
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
