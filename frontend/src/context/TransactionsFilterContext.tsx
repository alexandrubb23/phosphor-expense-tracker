import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { type TransactionFilter } from "@expense-tracker/core";

interface TransactionsFilterContextValue {
  filter: TransactionFilter;
  setFilter: Dispatch<SetStateAction<TransactionFilter>>;
}

const TransactionsFilterContext = createContext<
  TransactionsFilterContextValue | undefined
>(undefined);

export function TransactionsFilterProvider({
  children,
  initialFilter = {},
}: {
  children: ReactNode;
  initialFilter?: TransactionFilter;
}) {
  const [filter, setFilter] = useState<TransactionFilter>(initialFilter);
  return (
    <TransactionsFilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </TransactionsFilterContext.Provider>
  );
}

export function useTransactionsFilter() {
  const ctx = useContext(TransactionsFilterContext);
  if (!ctx) {
    throw new Error(
      "useTransactionsFilter must be used within TransactionsFilterProvider"
    );
  }
  return ctx;
}
