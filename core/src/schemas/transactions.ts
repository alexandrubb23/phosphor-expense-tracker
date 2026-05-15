import { z } from "zod";
import { OperationType } from "../constants/operation-type.js";
import { Category } from "../constants/category.js";
import { TransactionStatus } from "../constants/transaction-status.js";
import { SortDir } from "../enums/sort-dir.js";

const transactionFields = {
  description: z.string().trim().min(1).optional(),
  amount: z.number().positive().optional(),
  operationType: z.enum(OperationType).optional(),
  category: z.enum(Category).optional(),
  subcategory: z.string().trim().nullable().optional(),
  date: z.iso.datetime().optional(),
  status: z.enum(TransactionStatus).optional(),
};

export const UpdatePendingTransactionSchema = z
  .object(transactionFields)
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdatePendingTransaction = z.infer<
  typeof UpdatePendingTransactionSchema
>;

export const TRANSACTION_SORT_FIELDS = [
  "date",
  "amount",
  "description",
  "category",
  "status",
] as const;

export type TransactionSortField = (typeof TRANSACTION_SORT_FIELDS)[number];

export const TransactionSortSchema = z.object({
  sortBy: z.enum(TRANSACTION_SORT_FIELDS).optional().default("date"),
  sortDir: z.enum([SortDir.asc, SortDir.desc]).optional().default(SortDir.desc),
});

export type TransactionSort = z.infer<typeof TransactionSortSchema>;
