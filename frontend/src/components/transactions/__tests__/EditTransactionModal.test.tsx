import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AxiosError } from "axios";
import {
  OperationType,
  Category,
  Currency,
  TransactionStatus,
} from "@expense-tracker/core";
import type { Transaction } from "@/api/transactions";
import EditTransactionModal from "../EditTransactionModal";

const mockUpdateTransaction = vi.fn();

vi.mock("@/hooks/useTransactions", () => ({
  useUpdateTransaction: vi.fn(() => ({ mutateAsync: mockUpdateTransaction })),
}));

const salary: Transaction = {
  id: "tx-salary-001",
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

function renderModal(transaction: Transaction = salary, onClose = vi.fn()) {
  return {
    onClose,
    ...render(
      <EditTransactionModal transaction={transaction} onClose={onClose} />
    ),
  };
}

describe("EditTransactionModal", () => {
  beforeEach(() => {
    mockUpdateTransaction.mockReset();
  });

  describe("rendering", () => {
    it("renders the modal title", () => {
      renderModal();
      expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
    });

    it("pre-fills description with the transaction value", () => {
      renderModal();
      expect(screen.getByDisplayValue("Monthly Salary")).toBeInTheDocument();
    });

    it("pre-fills amount with the transaction value", () => {
      renderModal();
      expect(screen.getByDisplayValue("5000")).toBeInTheDocument();
    });

    it("pre-fills date with the transaction value", () => {
      renderModal();
      expect(screen.getByDisplayValue("2025-05-01")).toBeInTheDocument();
    });

    it("pre-selects operationType, category and status selects", () => {
      renderModal();
      const [typeSelect, categorySelect, statusSelect] =
        screen.getAllByRole<HTMLSelectElement>("combobox");
      expect(typeSelect.value).toBe(OperationType.Inflow);
      expect(categorySelect.value).toBe(Category.Salary);
      expect(statusSelect.value).toBe(TransactionStatus.Confirmed);
    });

    it("renders the Save and CANCEL buttons", () => {
      renderModal();
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it("does not show an error panel on initial render", () => {
      renderModal();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows description error when submitting with empty description", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.clear(screen.getByDisplayValue("Monthly Salary"));
      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(
        await screen.findByText(/description is required/i)
      ).toBeInTheDocument();
      expect(mockUpdateTransaction).not.toHaveBeenCalled();
    });

    it("shows amount error when amount is zero", async () => {
      const user = userEvent.setup();
      renderModal();

      const amountInput = screen.getByRole("spinbutton");
      await user.clear(amountInput);
      await user.type(amountInput, "0");
      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(
        await screen.findByText(/amount must be greater than 0/i)
      ).toBeInTheDocument();
      expect(mockUpdateTransaction).not.toHaveBeenCalled();
    });

    it("shows amount error when amount is negative", async () => {
      const user = userEvent.setup();
      renderModal();

      const amountInput = screen.getByRole("spinbutton");
      await user.clear(amountInput);
      await user.type(amountInput, "-50");
      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(
        await screen.findByText(/amount must be greater than 0/i)
      ).toBeInTheDocument();
      expect(mockUpdateTransaction).not.toHaveBeenCalled();
    });

    it("does not call updateTransaction when validation fails", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.clear(screen.getByDisplayValue("Monthly Salary"));
      await user.click(screen.getByRole("button", { name: /save/i }));

      await screen.findByRole("alert");
      expect(mockUpdateTransaction).not.toHaveBeenCalled();
    });
  });

  describe("successful submission", () => {
    it("calls updateTransaction with the transaction id and form data", async () => {
      mockUpdateTransaction.mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderModal();

      const descInput = screen.getByDisplayValue("Monthly Salary");
      await user.clear(descInput);
      await user.type(descInput, "Updated Salary");

      await user.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => expect(mockUpdateTransaction).toHaveBeenCalledOnce());
      const [payload] = mockUpdateTransaction.mock.calls[0];
      expect(payload).toMatchObject({
        id: salary.id,
        data: {
          description: "Updated Salary",
          amount: 5000,
          operationType: OperationType.Inflow,
          category: Category.Salary,
          status: TransactionStatus.Confirmed,
          date: "2025-05-01",
        },
      });
    });

    it("calls onClose after a successful save", async () => {
      mockUpdateTransaction.mockResolvedValue(undefined);
      const { onClose } = renderModal();

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    });

    it("does not show an error panel after a successful save", async () => {
      mockUpdateTransaction.mockResolvedValue(undefined);
      renderModal();

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => expect(mockUpdateTransaction).toHaveBeenCalledOnce());
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("shows the server error message from an AxiosError response", async () => {
      const axiosError = new AxiosError("Request failed");
      axiosError.response = {
        data: { error: "Transaction not found" },
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: {} as never,
      };
      mockUpdateTransaction.mockRejectedValue(axiosError);

      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(
        await screen.findByText(/transaction not found/i)
      ).toBeInTheDocument();
    });

    it("shows fallback message when AxiosError has no response body", async () => {
      const axiosError = new AxiosError("Network Error");
      mockUpdateTransaction.mockRejectedValue(axiosError);

      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(
        await screen.findByText(/failed to update transaction/i)
      ).toBeInTheDocument();
    });

    it("shows fallback message for non-Axios errors", async () => {
      mockUpdateTransaction.mockRejectedValue(new Error("Unexpected failure"));

      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(
        await screen.findByText(/failed to update transaction/i)
      ).toBeInTheDocument();
    });

    it("clears the server error when the next submission succeeds", async () => {
      mockUpdateTransaction
        .mockRejectedValueOnce(new Error("Oops"))
        .mockResolvedValueOnce(undefined);

      const user = userEvent.setup();
      renderModal();

      // First submit: fails → error shown
      await user.click(screen.getByRole("button", { name: /save/i }));
      expect(await screen.findByRole("alert")).toBeInTheDocument();

      // Second submit: succeeds → error clears
      await user.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() =>
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
      );
    });
  });

  describe("close behaviour", () => {
    it("calls onClose when the CANCEL button is clicked", async () => {
      const { onClose } = renderModal();
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onClose when the ✕ CLOSE button is clicked", async () => {
      const { onClose } = renderModal();
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /close/i }));

      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
