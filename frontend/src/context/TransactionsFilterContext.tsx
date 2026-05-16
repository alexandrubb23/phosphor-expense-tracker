import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { type PaginationState } from "@tanstack/react-table";
import {
  Category,
  OperationType,
  TransactionStatus,
  type TransactionFilter,
} from "@expense-tracker/core";

const VALID_PAGE_SIZES = [10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

type FilterUpdater =
  | TransactionFilter
  | ((prev: TransactionFilter) => TransactionFilter);
type PaginationUpdater =
  | PaginationState
  | ((prev: PaginationState) => PaginationState);

interface TransactionsFilterContextValue {
  filter: TransactionFilter;
  setFilter: (updater: FilterUpdater) => void;
  resetFilter: () => void;
  pagination: PaginationState;
  setPagination: (updater: PaginationUpdater) => void;
}

function parseFilter(params: URLSearchParams): TransactionFilter {
  const operationType = params.get("operationType");
  const category = params.get("category");
  const status = params.get("status");
  const search = params.get("search");
  return {
    operationType: (
      Object.values(OperationType) as string[]
    ).includes(operationType ?? "")
      ? (operationType as OperationType)
      : undefined,
    category: (Object.values(Category) as string[]).includes(category ?? "")
      ? (category as Category)
      : undefined,
    status: (Object.values(TransactionStatus) as string[]).includes(
      status ?? ""
    )
      ? (status as TransactionStatus)
      : undefined,
    search: search || undefined,
  };
}

function parsePagination(params: URLSearchParams): PaginationState {
  const pageNum = Number(params.get("page") ?? "1");
  const pageSizeNum = Number(params.get("pageSize") ?? String(DEFAULT_PAGE_SIZE));
  const page =
    Number.isFinite(pageNum) && pageNum >= 1 ? Math.floor(pageNum) : 1;
  const pageSize = (VALID_PAGE_SIZES as readonly number[]).includes(pageSizeNum)
    ? pageSizeNum
    : DEFAULT_PAGE_SIZE;
  return { pageIndex: page - 1, pageSize };
}

function hasInvalidPaginationParams(params: URLSearchParams): boolean {
  const rawPage = params.get("page");
  const rawPageSize = params.get("pageSize");
  const pageInvalid =
    rawPage !== null &&
    (!Number.isFinite(Number(rawPage)) || Number(rawPage) < 1);
  const pageSizeInvalid =
    rawPageSize !== null &&
    !(VALID_PAGE_SIZES as readonly number[]).includes(Number(rawPageSize));
  return pageInvalid || pageSizeInvalid;
}

const TransactionsFilterContext = createContext<
  TransactionsFilterContextValue | undefined
>(undefined);

export function TransactionsFilterProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Reset invalid pagination params immediately so the API never receives NaN
  useEffect(() => {
    if (!hasInvalidPaginationParams(searchParams)) return;
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        const pageNum = Number(prev.get("page"));
        const pageSizeNum = Number(prev.get("pageSize"));
        if (!Number.isFinite(pageNum) || pageNum < 1) p.set("page", "1");
        if (!(VALID_PAGE_SIZES as readonly number[]).includes(pageSizeNum))
          p.set("pageSize", String(DEFAULT_PAGE_SIZE));
        return p;
      },
      { replace: true }
    );
  }, [searchParams, setSearchParams]);

  const filter = useMemo(() => parseFilter(searchParams), [searchParams]);
  const pagination = useMemo(
    () => parsePagination(searchParams),
    [searchParams]
  );

  const setFilter = useCallback(
    (updater: FilterUpdater) => {
      const next =
        typeof updater === "function" ? updater(filter) : updater;
      if (
        next.search === filter.search &&
        next.operationType === filter.operationType &&
        next.category === filter.category &&
        next.status === filter.status
      )
        return;
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          next.search ? p.set("search", next.search) : p.delete("search");
          next.operationType
            ? p.set("operationType", next.operationType)
            : p.delete("operationType");
          next.category
            ? p.set("category", next.category)
            : p.delete("category");
          next.status ? p.set("status", next.status) : p.delete("status");
          p.set("page", "1");
          return p;
        },
        { replace: true }
      );
    },
    [filter, setSearchParams]
  );

  const setPagination = useCallback(
    (updater: PaginationUpdater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set("page", String(next.pageIndex + 1));
          p.set("pageSize", String(next.pageSize));
          return p;
        },
        { replace: true }
      );
    },
    [pagination, setSearchParams]
  );

  const resetFilter = useCallback(() => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete("search");
        p.delete("operationType");
        p.delete("category");
        p.delete("status");
        p.set("page", "1");
        return p;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  return (
    <TransactionsFilterContext.Provider
      value={{ filter, setFilter, resetFilter, pagination, setPagination }}
    >
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
