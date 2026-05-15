import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import {
  OperationType,
  Category,
  TransactionStatus,
  Currency,
} from "@expense-tracker/core";
import type { PaginatedResult } from "@expense-tracker/core";
import type { Transaction } from "@/api/transactions";

function makePage(data: Transaction[]): PaginatedResult<Transaction> {
  return { data, total: data.length, page: 1, pageSize: 10, totalPages: 1 };
}
import TransactionsTable from "../TransactionsTable";
import { TransactionsFilterProvider } from "../../../context/TransactionsFilterContext";

const mockDeleteTransaction = vi.fn();

vi.mock("@/hooks/useTransactions", () => ({
  useTransactions: vi.fn(),
  useDeleteTransaction: vi.fn(() => ({ mutate: mockDeleteTransaction })),
}));

import { useTransactions } from "@/hooks/useTransactions";
const mockUseTransactions = vi.mocked(useTransactions);

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

beforeEach(() => {
  mockDeleteTransaction.mockClear();
});

function setupTransactions(data: Transaction[] = []) {
  mockUseTransactions.mockReturnValue({
    data: makePage(data),
  } as ReturnType<typeof useTransactions>);
}

function renderTransactionsTable() {
  return render(
    <TransactionsFilterProvider>
      <TransactionsTable />
    </TransactionsFilterProvider>
  );
}

describe("TransactionsTable", () => {
  describe("empty state", () => {
    it("shows empty state message when no transactions", () => {
      setupTransactions([]);
      renderTransactionsTable();
      expect(screen.getByText(/NO RECORDS FOUND/i)).toBeInTheDocument();
    });

    it("hides the table when no transactions", () => {
      setupTransactions([]);
      renderTransactionsTable();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  describe("rendering", () => {
    it("renders a row for each transaction", () => {
      setupTransactions(ALL);
      renderTransactionsTable();
      expect(screen.getByText("Monthly Salary")).toBeInTheDocument();
      expect(screen.getByText("Groceries")).toBeInTheDocument();
      expect(screen.getByText("Electric Bill")).toBeInTheDocument();
    });

    it("renders all table column headers", () => {
      setupTransactions(ALL);
      renderTransactionsTable();
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
      setupTransactions([salary]);
      renderTransactionsTable();
      expect(screen.getByText("TX-1111")).toBeInTheDocument();
    });

    it("formats date to YYYY-MM-DD", () => {
      setupTransactions([salary]);
      renderTransactionsTable();
      expect(screen.getByText("2025-05-01")).toBeInTheDocument();
    });

    it("renders category badge for each row", () => {
      setupTransactions(ALL);
      renderTransactionsTable();
      expect(
        screen.getAllByText(Category.Salary).length
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(Category.Food).length).toBeGreaterThanOrEqual(
        1
      );
      expect(
        screen.getAllByText(Category.Utilities).length
      ).toBeGreaterThanOrEqual(1);
    });

    it.each([
      { transaction: salary, expectedStatus: "CONFIRMED" },
      { transaction: pendingExpense, expectedStatus: "PENDING" },
    ])(
      "shows $expectedStatus status for $transaction.description",
      ({ transaction, expectedStatus }) => {
        setupTransactions([transaction]);
        renderTransactionsTable();
        expect(screen.getByText(expectedStatus)).toBeInTheDocument();
      }
    );

    it.each([
      { transaction: salary, pattern: /\+5,000\.00 RON/ },
      { transaction: groceries, pattern: /−150\.50 RON/ },
    ])(
      "formats amount correctly for $transaction.description",
      ({ transaction, pattern }) => {
        setupTransactions([transaction]);
        renderTransactionsTable();
        expect(screen.getByText(pattern)).toBeInTheDocument();
      }
    );
  });

  describe("delete button", () => {
    it("shows delete button only for pending transactions", () => {
      setupTransactions(ALL);
      renderTransactionsTable();
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      expect(deleteButtons).toHaveLength(1);
      expect(deleteButtons[0]).toHaveAttribute(
        "aria-label",
        `Delete ${pendingExpense.description}`
      );
    });

    it("does not show delete button for confirmed transactions", () => {
      setupTransactions([salary]);
      renderTransactionsTable();
      expect(
        screen.queryByRole("button", { name: /delete/i })
      ).not.toBeInTheDocument();
    });

    it("calls deleteTransaction with the transaction id after confirmation", async () => {
      setupTransactions([pendingExpense]);
      const user = userEvent.setup();
      vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));

      renderTransactionsTable();

      await user.click(screen.getByRole("button", { name: /delete/i }));

      expect(window.confirm).toHaveBeenCalledWith(
        `Delete "${pendingExpense.description}"?`
      );
      expect(mockDeleteTransaction).toHaveBeenCalledWith(pendingExpense.id);

      vi.unstubAllGlobals();
    });

    it("does not call deleteTransaction when user cancels", async () => {
      setupTransactions([pendingExpense]);
      const user = userEvent.setup();
      vi.stubGlobal("confirm", vi.fn().mockReturnValue(false));

      renderTransactionsTable();

      await user.click(screen.getByRole("button", { name: /delete/i }));

      expect(mockDeleteTransaction).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });

  describe("pagination controls", () => {
    it("shows record count", () => {
      setupTransactions(ALL);
      renderTransactionsTable();
      expect(screen.getByText(/3 records/i)).toBeInTheDocument();
    });

    it("shows page indicator", () => {
      setupTransactions(ALL);
      renderTransactionsTable();
      expect(screen.getByText("1 / 1")).toBeInTheDocument();
    });

    it("disables prev button on first page", () => {
      setupTransactions(ALL);
      renderTransactionsTable();
      expect(
        screen.getByRole("button", { name: /previous page/i })
      ).toBeDisabled();
    });

    it("disables next button when on last page", () => {
      setupTransactions(ALL);
      renderTransactionsTable();
      expect(screen.getByRole("button", { name: /next page/i })).toBeDisabled();
    });
  });
});
