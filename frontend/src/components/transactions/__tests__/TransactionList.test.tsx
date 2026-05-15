import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import {
  OperationType,
  Category,
  TransactionStatus,
  Currency,
} from "@expense-tracker/core";
import type { Transaction } from "@/api/transactions";
import TransactionList from "../TransactionList";

const salary: Transaction = {
  id: "aaa-bbb-ccc-1111",
  userId: "user-1",
  description: "Monthly Salary",
  amount: "5000.00",
  operationType: OperationType.Inflow,
  category: Category.Salary,
  subcategory: null,
  currency: Currency.RON,
  status: TransactionStatus.Confirmed,
  date: "2025-05-01T00:00:00.000Z",
  rawEmailBody: null,
  createdAt: "2025-05-01T08:00:00.000Z",
  updatedAt: "2025-05-01T08:00:00.000Z",
};

const groceries: Transaction = {
  id: "ddd-eee-fff-2222",
  userId: "user-1",
  description: "Groceries",
  amount: "150.50",
  operationType: OperationType.Outflow,
  category: Category.Food,
  subcategory: null,
  currency: Currency.RON,
  status: TransactionStatus.Confirmed,
  date: "2025-05-02T00:00:00.000Z",
  rawEmailBody: null,
  createdAt: "2025-05-02T09:00:00.000Z",
  updatedAt: "2025-05-02T09:00:00.000Z",
};

const pendingExpense: Transaction = {
  id: "ggg-hhh-iii-3333",
  userId: "user-1",
  description: "Electric Bill",
  amount: "95.00",
  operationType: OperationType.Outflow,
  category: Category.Utilities,
  subcategory: null,
  currency: Currency.RON,
  status: TransactionStatus.Pending,
  date: "2025-05-03T00:00:00.000Z",
  rawEmailBody: null,
  createdAt: "2025-05-03T10:00:00.000Z",
  updatedAt: "2025-05-03T10:00:00.000Z",
};

const ALL = [salary, groceries, pendingExpense];

describe("TransactionList", () => {
  describe("empty state", () => {
    it("shows empty state message when no transactions", () => {
      render(<TransactionList transactions={[]} onDelete={vi.fn()} />);
      expect(screen.getByText(/NO RECORDS FOUND/i)).toBeInTheDocument();
    });

    it("hides the table when no transactions", () => {
      render(<TransactionList transactions={[]} onDelete={vi.fn()} />);
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  describe("rendering", () => {
    it("renders a row for each transaction", () => {
      render(<TransactionList transactions={ALL} onDelete={vi.fn()} />);
      expect(screen.getByText("Monthly Salary")).toBeInTheDocument();
      expect(screen.getByText("Groceries")).toBeInTheDocument();
      expect(screen.getByText("Electric Bill")).toBeInTheDocument();
    });

    it("renders all table column headers", () => {
      render(<TransactionList transactions={ALL} onDelete={vi.fn()} />);
      for (const heading of [
        "ID",
        "T·STAMP",
        "DESCRIPTOR",
        "CHANNEL",
        "STATUS",
        "DELTA",
      ]) {
        expect(screen.getByText(heading)).toBeInTheDocument();
      }
    });

    it("derives short ID from the last 4 chars of the id", () => {
      render(<TransactionList transactions={[salary]} onDelete={vi.fn()} />);
      expect(screen.getByText("TX-1111")).toBeInTheDocument();
    });

    it("formats date to YYYY-MM-DD", () => {
      render(<TransactionList transactions={[salary]} onDelete={vi.fn()} />);
      expect(screen.getByText("2025-05-01")).toBeInTheDocument();
    });

    it("renders category badge for each row", () => {
      render(<TransactionList transactions={ALL} onDelete={vi.fn()} />);
      // Each category appears at least once (also present in dropdown options)
      expect(screen.getAllByText(Category.Salary).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(Category.Food).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(Category.Utilities).length).toBeGreaterThanOrEqual(1);
    });

    it("shows CONFIRMED status for confirmed transactions", () => {
      render(<TransactionList transactions={[salary]} onDelete={vi.fn()} />);
      expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    });

    it("shows PENDING status for pending transactions", () => {
      render(
        <TransactionList transactions={[pendingExpense]} onDelete={vi.fn()} />
      );
      expect(screen.getByText("PENDING")).toBeInTheDocument();
    });

    it("formats inflow amount with + prefix and currency", () => {
      render(<TransactionList transactions={[salary]} onDelete={vi.fn()} />);
      expect(screen.getByText(/\+5,000\.00 RON/)).toBeInTheDocument();
    });

    it("formats outflow amount with − prefix and currency", () => {
      render(<TransactionList transactions={[groceries]} onDelete={vi.fn()} />);
      expect(screen.getByText(/−150\.50 RON/)).toBeInTheDocument();
    });
  });

  describe("delete button", () => {
    it("shows delete button only for pending transactions", () => {
      render(<TransactionList transactions={ALL} onDelete={vi.fn()} />);
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      expect(deleteButtons).toHaveLength(1);
      expect(deleteButtons[0]).toHaveAttribute(
        "aria-label",
        `Delete ${pendingExpense.description}`
      );
    });

    it("does not show delete button for confirmed transactions", () => {
      render(<TransactionList transactions={[salary]} onDelete={vi.fn()} />);
      expect(
        screen.queryByRole("button", { name: /delete/i })
      ).not.toBeInTheDocument();
    });

    it("calls onDelete with the transaction id after confirmation", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));

      render(
        <TransactionList transactions={[pendingExpense]} onDelete={onDelete} />
      );

      await user.click(screen.getByRole("button", { name: /delete/i }));

      expect(window.confirm).toHaveBeenCalledWith(
        `Delete "${pendingExpense.description}"?`
      );
      expect(onDelete).toHaveBeenCalledWith(pendingExpense.id);

      vi.unstubAllGlobals();
    });

    it("does not call onDelete when user cancels the confirmation", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      vi.stubGlobal("confirm", vi.fn().mockReturnValue(false));

      render(
        <TransactionList transactions={[pendingExpense]} onDelete={onDelete} />
      );

      await user.click(screen.getByRole("button", { name: /delete/i }));

      expect(onDelete).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });

  describe("filter by flow type", () => {
    it("shows all transactions by default", () => {
      render(<TransactionList transactions={ALL} onDelete={vi.fn()} />);
      expect(screen.getByText("Monthly Salary")).toBeInTheDocument();
      expect(screen.getByText("Groceries")).toBeInTheDocument();
      expect(screen.getByText("Electric Bill")).toBeInTheDocument();
    });

    it("filters to inflow only", async () => {
      const user = userEvent.setup();
      render(<TransactionList transactions={ALL} onDelete={vi.fn()} />);

      await user.selectOptions(
        screen.getAllByRole("combobox")[0],
        OperationType.Inflow
      );

      expect(screen.getByText("Monthly Salary")).toBeInTheDocument();
      expect(screen.queryByText("Groceries")).not.toBeInTheDocument();
      expect(screen.queryByText("Electric Bill")).not.toBeInTheDocument();
    });

    it("filters to outflow only", async () => {
      const user = userEvent.setup();
      render(<TransactionList transactions={ALL} onDelete={vi.fn()} />);

      await user.selectOptions(
        screen.getAllByRole("combobox")[0],
        OperationType.Outflow
      );

      expect(screen.queryByText("Monthly Salary")).not.toBeInTheDocument();
      expect(screen.getByText("Groceries")).toBeInTheDocument();
      expect(screen.getByText("Electric Bill")).toBeInTheDocument();
    });

    it("shows empty state when no transactions match flow filter", async () => {
      const user = userEvent.setup();
      render(<TransactionList transactions={[salary]} onDelete={vi.fn()} />);

      await user.selectOptions(
        screen.getAllByRole("combobox")[0],
        OperationType.Outflow
      );

      expect(screen.getByText(/NO RECORDS FOUND/i)).toBeInTheDocument();
    });
  });

  describe("filter by category", () => {
    it("populates category dropdown from transactions", () => {
      render(<TransactionList transactions={ALL} onDelete={vi.fn()} />);
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

    it("filters by a specific category", async () => {
      const user = userEvent.setup();
      render(<TransactionList transactions={ALL} onDelete={vi.fn()} />);

      await user.selectOptions(
        screen.getAllByRole("combobox")[1],
        Category.Food
      );

      expect(screen.getByText("Groceries")).toBeInTheDocument();
      expect(screen.queryByText("Monthly Salary")).not.toBeInTheDocument();
      expect(screen.queryByText("Electric Bill")).not.toBeInTheDocument();
    });
  });
});
