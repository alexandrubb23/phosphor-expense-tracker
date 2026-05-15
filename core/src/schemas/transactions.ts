import { z } from "zod";
import { OperationType } from "../constants/operation-type.js";
import { Category } from "../constants/category.js";
import { TransactionStatus } from "../constants/transaction-status.js";

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
