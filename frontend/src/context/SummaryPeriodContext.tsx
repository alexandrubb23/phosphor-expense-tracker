import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  SummaryPeriod,
  SUMMARY_PERIODS,
  type TransactionSummaryQuery,
} from "@expense-tracker/core";

export { SummaryPeriod, SUMMARY_PERIODS };

interface SummaryPeriodContextValue {
  period: SummaryPeriod;
  from: string | undefined;
  to: string | undefined;
  query: TransactionSummaryQuery;
  setPeriod: (period: SummaryPeriod) => void;
  setFrom: (from: string | undefined) => void;
  setTo: (to: string | undefined) => void;
}

const SummaryPeriodContext = createContext<
  SummaryPeriodContextValue | undefined
>(undefined);

export function SummaryPeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<SummaryPeriod>(SummaryPeriod.month);
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);

  const query = useMemo<TransactionSummaryQuery>(
    () => ({ period, from, to }),
    [period, from, to]
  );

  return (
    <SummaryPeriodContext.Provider
      value={{ period, from, to, query, setPeriod, setFrom, setTo }}
    >
      {children}
    </SummaryPeriodContext.Provider>
  );
}

export function useSummaryPeriod() {
  const ctx = useContext(SummaryPeriodContext);
  if (!ctx) {
    throw new Error(
      "useSummaryPeriod must be used within SummaryPeriodProvider"
    );
  }
  return ctx;
}
