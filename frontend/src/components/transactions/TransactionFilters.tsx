import { useCallback, useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import {
  OperationType,
  TransactionStatus,
  Category,
} from "@expense-tracker/core";
import { useTransactionsFilter } from "../../context/TransactionsFilterContext";
import FilterSelect, { type FilterSelectKey } from "./FilterSelect";
import ResetButton from "../ui/ResetButton";

const SEARCH_DEBOUNCE_MS = 350;

export default function TransactionFilters() {
  const { filter, setFilter, resetFilter } = useTransactionsFilter();

  const [searchInput, setSearchInput] = useState(filter.search ?? "");
  const [debouncedSearch] = useDebounceValue(searchInput, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const trimmed = debouncedSearch.trim() || undefined;
    setFilter((prev) => {
      if (prev.search === trimmed) return prev;
      return { ...prev, search: trimmed };
    });
  }, [debouncedSearch, setFilter]);

  // Sync local input when filter.search changes externally (e.g. browser back/forward)
  useEffect(() => {
    setSearchInput((prev) => {
      const external = filter.search ?? "";
      return prev === external ? prev : external;
    });
  }, [filter.search]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
  }, []);

  const handleSelectChange = useCallback(
    (name: FilterSelectKey, value: string) => {
      setFilter((prev) => ({
        ...prev,
        [name]: value === "all" ? undefined : value,
      }));
    },
    [setFilter]
  );

  const handleReset = useCallback(() => {
    setSearchInput("");
    resetFilter();
  }, [resetFilter]);

  const isFiltered =
    searchInput !== "" ||
    !!filter.operationType ||
    !!filter.category ||
    !!filter.status;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 border border-hairline bg-surface px-4.5 py-3.5 font-mono">
      <span className="text-[10px] uppercase tracking-[0.28em] text-purple">
        ▸ FILTER
      </span>
      <div className="relative">
        <input
          type="text"
          placeholder="Search…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-48 border border-hairline-glow bg-panel px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink placeholder:text-muted focus:outline-none focus:border-purple-dim"
        />
        {searchInput && (
          <button
            onClick={handleClearSearch}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted hover:text-red text-xs leading-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      <FilterSelect
        name="operationType"
        value={filter.operationType ?? "all"}
        onChange={handleSelectChange}
      >
        <option value="all" className="bg-panel-raised">
          All Flows
        </option>
        <option value={OperationType.Inflow} className="bg-panel-raised">
          Inflow
        </option>
        <option value={OperationType.Outflow} className="bg-panel-raised">
          Outflow
        </option>
      </FilterSelect>
      <FilterSelect
        name="category"
        value={filter.category ?? "all"}
        onChange={handleSelectChange}
      >
        <option value="all" className="bg-panel-raised">
          All Categories
        </option>
        {Object.values(Category).map((cat) => (
          <option key={cat} value={cat} className="bg-panel-raised">
            {cat}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        name="status"
        value={filter.status ?? "all"}
        onChange={handleSelectChange}
      >
        <option value="all" className="bg-panel-raised">
          All Statuses
        </option>
        <option value={TransactionStatus.Confirmed} className="bg-panel-raised">
          Confirmed
        </option>
        <option value={TransactionStatus.Pending} className="bg-panel-raised">
          Pending
        </option>
      </FilterSelect>
      {isFiltered && (
        <ResetButton onClick={handleReset} aria-label="Reset all filters" />
      )}
    </div>
  );
}
