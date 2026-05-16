import { render, screen, within, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { useEffect, useRef } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  OperationType,
  Category,
  TransactionStatus,
  type TransactionFilter,
} from "@expense-tracker/core";
import TransactionFilters from "../TransactionFilters";
import {
  TransactionsFilterProvider,
  useTransactionsFilter,
} from "../../../context/TransactionsFilterContext";

/** Records every filter change (skips the initial mount value). */
function FilterSpy({
  onFilterChange,
}: {
  onFilterChange: (f: TransactionFilter) => void;
}) {
  const { filter } = useTransactionsFilter();
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    onFilterChange(filter);
  }, [filter, onFilterChange]);
  return null;
}

function renderWithFilters(
  onFilterChange?: (f: TransactionFilter) => void,
  initialEntry = "/"
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="*"
          element={
            <TransactionsFilterProvider>
              {onFilterChange && <FilterSpy onFilterChange={onFilterChange} />}
              <TransactionFilters />
            </TransactionsFilterProvider>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("TransactionFilters", () => {
  describe("flow type select", () => {
    it("renders All Flows by default", () => {
      renderWithFilters();
      const select = screen.getAllByRole("combobox")[0];
      expect((select as HTMLSelectElement).value).toBe("all");
    });

    it("calls onFilterChange with inflow when selected", async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      renderWithFilters(onFilterChange);

      await user.selectOptions(
        screen.getAllByRole("combobox")[0],
        OperationType.Inflow
      );

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ operationType: OperationType.Inflow })
      );
    });

    it("calls onFilterChange with outflow when selected", async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      renderWithFilters(onFilterChange);

      await user.selectOptions(
        screen.getAllByRole("combobox")[0],
        OperationType.Outflow
      );

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ operationType: OperationType.Outflow })
      );
    });
  });

  describe("category select", () => {
    it("populates category dropdown with all enum values", () => {
      renderWithFilters();
      const categorySelect = screen.getAllByRole("combobox")[1];
      expect(
        within(categorySelect).getByRole("option", { name: Category.Food })
      ).toBeInTheDocument();
      expect(
        within(categorySelect).getByRole("option", { name: Category.Salary })
      ).toBeInTheDocument();
      expect(
        within(categorySelect).getByRole("option", {
          name: Category.Utilities,
        })
      ).toBeInTheDocument();
    });

    it("calls onFilterChange with category when selected", async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      renderWithFilters(onFilterChange);

      await user.selectOptions(
        screen.getAllByRole("combobox")[1],
        Category.Food
      );

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ category: Category.Food })
      );
    });
  });

  describe("status select", () => {
    it("calls onFilterChange with status when selected", async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      renderWithFilters(onFilterChange);

      await user.selectOptions(
        screen.getAllByRole("combobox")[2],
        TransactionStatus.Pending
      );

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: TransactionStatus.Pending })
      );
    });
  });

  describe("search", () => {
    it("calls onFilterChange with trimmed search after debounce", async () => {
      vi.useFakeTimers();
      const onFilterChange = vi.fn();
      renderWithFilters(onFilterChange);

      const input = screen.getByPlaceholderText("Search…");
      fireEvent.change(input, { target: { value: "Salary" } });

      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: "Salary" })
      );
      vi.useRealTimers();
    });

    it("clears search when × button is clicked", async () => {
      vi.useFakeTimers();
      const onFilterChange = vi.fn();
      renderWithFilters(onFilterChange, "/?search=foo");

      fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: undefined })
      );
      vi.useRealTimers();
    });
  });

  describe("reset button", () => {
    it("is hidden when no filters are active", () => {
      renderWithFilters();
      expect(
        screen.queryByRole("button", { name: "Reset all filters" })
      ).not.toBeInTheDocument();
    });

    it("clears search param after debounce fires then reset is clicked", async () => {
      vi.useFakeTimers();
      const onFilterChange = vi.fn();
      renderWithFilters(onFilterChange);

      const input = screen.getByPlaceholderText("Search…");
      fireEvent.change(input, { target: { value: "hello" } });

      // Let debounce fire so search param is written to URL
      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      onFilterChange.mockClear();

      // Click the reset button
      const resetBtn = screen.getByRole("button", {
        name: "Reset all filters",
      });
      await act(async () => {
        fireEvent.click(resetBtn);
      });

      // Advance past debounce to ensure no stale debouncedSearch re-adds the param
      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: undefined })
      );
      // Must NOT have been called again to re-add the search
      const calls = onFilterChange.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall?.[0]).toMatchObject({ search: undefined });
      vi.useRealTimers();
    });

    it("clears dropdown filters when reset is clicked", async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      renderWithFilters(onFilterChange);

      await user.selectOptions(
        screen.getAllByRole("combobox")[0],
        OperationType.Inflow
      );

      onFilterChange.mockClear();

      await user.click(
        screen.getByRole("button", { name: "Reset all filters" })
      );

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ operationType: undefined })
      );
    });
  });
});
