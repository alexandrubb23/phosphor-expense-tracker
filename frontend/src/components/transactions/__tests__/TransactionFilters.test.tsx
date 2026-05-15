import { render, screen, within, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { useEffect, useRef } from "react";
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
  initialFilter?: TransactionFilter
) {
  return render(
    <TransactionsFilterProvider initialFilter={initialFilter}>
      {onFilterChange && <FilterSpy onFilterChange={onFilterChange} />}
      <TransactionFilters />
    </TransactionsFilterProvider>
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
      renderWithFilters(onFilterChange, { search: "foo" });

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
});
