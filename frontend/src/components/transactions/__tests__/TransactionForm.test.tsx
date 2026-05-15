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
import TransactionForm from "../TransactionForm";

const mockCreateTransaction = vi.fn();

vi.mock("@/hooks/useTransactions", () => ({
  useCreateTransaction: vi.fn(() => ({ mutateAsync: mockCreateTransaction })),
}));

const TODAY = "2026-05-15";
vi.setSystemTime(new Date(`${TODAY}T12:00:00.000Z`));

function renderForm() {
  return render(<TransactionForm />);
}

describe("TransactionForm", () => {
  beforeEach(() => {
    mockCreateTransaction.mockReset();
  });

  describe("rendering", () => {
    it("renders all form fields and submit button", () => {
      renderForm();

      expect(
        screen.getByPlaceholderText(/describe entry/i)
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument();
      // two unlabelled selects: operationType first, category second
      const selects = screen.getAllByRole("combobox");
      expect(selects).toHaveLength(2);
      expect(
        screen.getByRole("button", { name: /transmit/i })
      ).toBeInTheDocument();
    });

    it("pre-selects Outflow and Food as default operation and category", () => {
      renderForm();

      const [operationTypeSelect, categorySelect] =
        screen.getAllByRole<HTMLSelectElement>("combobox");
      expect(operationTypeSelect.value).toBe(OperationType.Outflow);
      expect(categorySelect.value).toBe(Category.Food);
    });

    it("does not show error panel on initial render", () => {
      renderForm();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows description error when submitting with empty description", async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByPlaceholderText(/amount/i), "50");
      await user.click(screen.getByRole("button", { name: /transmit/i }));

      expect(
        await screen.findByText(/description is required/i)
      ).toBeInTheDocument();
      expect(mockCreateTransaction).not.toHaveBeenCalled();
    });

    it("shows amount error when submitting with amount of zero", async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByPlaceholderText(/describe entry/i), "Coffee");
      await user.type(screen.getByPlaceholderText(/amount/i), "0");
      await user.click(screen.getByRole("button", { name: /transmit/i }));

      expect(
        await screen.findByText(/amount must be greater than 0/i)
      ).toBeInTheDocument();
      expect(mockCreateTransaction).not.toHaveBeenCalled();
    });

    it("shows amount error when amount is negative", async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByPlaceholderText(/describe entry/i), "Coffee");
      await user.type(screen.getByPlaceholderText(/amount/i), "-10");
      await user.click(screen.getByRole("button", { name: /transmit/i }));

      expect(
        await screen.findByText(/amount must be greater than 0/i)
      ).toBeInTheDocument();
      expect(mockCreateTransaction).not.toHaveBeenCalled();
    });
  });

  describe("successful submission", () => {
    it("calls createTransaction with correct data on valid submit", async () => {
      mockCreateTransaction.mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByPlaceholderText(/describe entry/i), "Coffee");
      await user.clear(screen.getByPlaceholderText(/amount/i));
      await user.type(screen.getByPlaceholderText(/amount/i), "4.50");
      await user.click(screen.getByRole("button", { name: /transmit/i }));

      await waitFor(() => expect(mockCreateTransaction).toHaveBeenCalledOnce());

      const [payload] = mockCreateTransaction.mock.calls[0];
      expect(payload).toMatchObject({
        description: "Coffee",
        amount: 4.5,
        operationType: OperationType.Outflow,
        category: Category.Food,
        currency: Currency.RON,
        status: TransactionStatus.Confirmed,
        date: expect.any(Date),
      });
    });

    it("resets the form after successful submission", async () => {
      mockCreateTransaction.mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderForm();

      const descInput = screen.getByPlaceholderText(/describe entry/i);
      await user.type(descInput, "Coffee");
      await user.type(screen.getByPlaceholderText(/amount/i), "4.50");
      await user.click(screen.getByRole("button", { name: /transmit/i }));

      await waitFor(() =>
        expect((descInput as HTMLInputElement).value).toBe("")
      );
    });

    it("does not show an error panel after successful submission", async () => {
      mockCreateTransaction.mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByPlaceholderText(/describe entry/i), "Salary");
      await user.type(screen.getByPlaceholderText(/amount/i), "3000");
      await user.click(screen.getByRole("button", { name: /transmit/i }));

      await waitFor(() => expect(mockCreateTransaction).toHaveBeenCalledOnce());
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("shows server error message from AxiosError response", async () => {
      const axiosError = new AxiosError("Request failed");
      axiosError.response = {
        data: { error: "Duplicate transaction" },
        status: 409,
        statusText: "Conflict",
        headers: {},
        config: {} as never,
      };
      mockCreateTransaction.mockRejectedValue(axiosError);

      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByPlaceholderText(/describe entry/i), "Coffee");
      await user.type(screen.getByPlaceholderText(/amount/i), "4.50");
      await user.click(screen.getByRole("button", { name: /transmit/i }));

      expect(
        await screen.findByText(/duplicate transaction/i)
      ).toBeInTheDocument();
    });

    it("shows fallback error message when AxiosError has no response body", async () => {
      const axiosError = new AxiosError("Network Error");
      mockCreateTransaction.mockRejectedValue(axiosError);

      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByPlaceholderText(/describe entry/i), "Coffee");
      await user.type(screen.getByPlaceholderText(/amount/i), "4.50");
      await user.click(screen.getByRole("button", { name: /transmit/i }));

      expect(
        await screen.findByText(/failed to create transaction/i)
      ).toBeInTheDocument();
    });

    it("shows generic error message for non-Axios errors", async () => {
      mockCreateTransaction.mockRejectedValue(new Error("Unknown error"));

      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByPlaceholderText(/describe entry/i), "Coffee");
      await user.type(screen.getByPlaceholderText(/amount/i), "4.50");
      await user.click(screen.getByRole("button", { name: /transmit/i }));

      expect(
        await screen.findByText(/failed to create transaction/i)
      ).toBeInTheDocument();
    });
  });
});
