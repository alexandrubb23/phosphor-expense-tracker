import { Rectangle } from "recharts";
import type { BarShapeProps } from "recharts/types/cartesian/Bar";
import { CATEGORY_COLORS, CATEGORY_COLOR_FALLBACK } from "../../categoryColors";
import { formatCurrency } from "@/lib/currency";

export interface ChartEntry {
  name: string;
  value: number;
}

interface TooltipPayloadItem {
  value: number;
  payload: ChartEntry;
}

export function CustomTooltip({
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
        {formatCurrency(entry.value)}
      </div>
    </div>
  );
}

export function barShape(props: BarShapeProps) {
  const fill =
    CATEGORY_COLORS[props.name as string] ??
    CATEGORY_COLOR_FALLBACK[
      (props.index as number) % CATEGORY_COLOR_FALLBACK.length
    ];
  return <Rectangle {...props} fill={fill} />;
}
