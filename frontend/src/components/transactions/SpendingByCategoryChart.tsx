import { useIsMobile } from "@/hooks/useIsMobile";
import { useTransactionSummary } from "@/hooks/useTransactions";
import { useSummaryPeriod } from "@/context/SummaryPeriodContext";
import SpendingByCategoryDesktopChart from "./SpendingByCategoryDesktopChart";
import SpendingByCategoryMobileChart from "./SpendingByCategoryMobileChart";
export default function SpendingByCategoryChart() {
  const { query } = useSummaryPeriod();
  const { data: summary } = useTransactionSummary(query);
  const isMobile = useIsMobile();

  const data = (summary?.byCategory ?? [])
    .map((c) => ({ name: c.category, value: c.total }))
    .sort((a, b) => a.value - b.value);

  if (data.length === 0) {
    return (
      <p className="py-10 text-center font-mono text-[13px] uppercase tracking-widest text-muted">
        [_] NO SIGNAL · STANDBY [_]
      </p>
    );
  }

  return isMobile ? (
    <SpendingByCategoryMobileChart data={data} />
  ) : (
    <SpendingByCategoryDesktopChart data={data} />
  );
}
