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
          stroke="#1a2535"
          strokeDasharray="2 6"
        />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9 }}
          tickFormatter={(v: number) => `${currency}${v}`}
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
          cursor={{ fill: "rgba(0, 229, 255, 0.05)" }}
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
