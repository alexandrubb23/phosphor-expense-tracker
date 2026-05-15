import { z } from "zod";
import {
  OperationType,
  Category,
  TransactionStatus,
} from "@expense-tracker/core";

/**
 * Base form schema shared by TransactionForm (create) and EditTransactionModal (edit).
 * TransactionForm extends this with a `currency` field.
 */
export const transactionFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(200, "Description must be 200 characters or fewer"),
  amount: z.number().positive("Amount must be greater than 0"),
  operationType: z.enum(OperationType),
  category: z.enum(Category),
  date: z.string().min(1, "Date is required"),
  status: z.enum(TransactionStatus),
});

export type TransactionFormFields = z.infer<typeof transactionFormSchema>;
