import { z } from "zod";
import { OperationType } from "../constants/operation-type.js";
import { Category } from "../constants/category.js";
import { TransactionStatus } from "../constants/transaction-status.js";
import { Currency } from "../constants/currency.js";
import { SortDir } from "../enums/sort-dir.js";
import { SummaryPeriod } from "../enums/summary-period.js";

export const CreateTransactionSchema = z.object({
  description: z.string().trim().min(1).max(200),
  amount: z.number().positive(),
  operationType: z.enum(OperationType),
  category: z.enum(Category),
  subcategory: z.string().trim().nullable().optional(),
  date: z.coerce.date(),
  currency: z.enum(Currency).optional().default(Currency.RON),
  status: z
    .enum(TransactionStatus)
    .optional()
    .default(TransactionStatus.Confirmed),
});

export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;

export const UpdateTransactionSchema = z
  .object({
    description: z.string().trim().min(1).max(200).optional(),
    amount: z.number().positive().optional(),
    operationType: z.enum(OperationType).optional(),
    category: z.enum(Category).optional(),
    subcategory: z.string().trim().nullable().optional(),
    date: z.string().optional(),
    status: z.enum(TransactionStatus).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;

/** @deprecated use UpdateTransactionSchema */
export const UpdatePendingTransactionSchema = UpdateTransactionSchema;
/** @deprecated use UpdateTransaction */
export type UpdatePendingTransaction = UpdateTransaction;

export const TransactionFilterSchema = z.object({
  operationType: z.enum(OperationType).optional(),
  category: z.enum(Category).optional(),
  status: z.enum(TransactionStatus).optional(),
  search: z.string().trim().optional(),
});

export type TransactionFilter = z.infer<typeof TransactionFilterSchema>;

export const TransactionPaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(1000).optional().default(10),
});

export type TransactionPagination = z.infer<typeof TransactionPaginationSchema>;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const SUMMARY_PERIODS = Object.values(SummaryPeriod) as [
  SummaryPeriod,
  ...SummaryPeriod[],
];

export const TransactionSummaryQuerySchema = z.object({
  period: z.enum(SUMMARY_PERIODS).optional().default(SummaryPeriod.month),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type TransactionSummaryQuery = z.infer<
  typeof TransactionSummaryQuerySchema
>;

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface TransactionSummary {
  totalInflow: number;
  totalOutflow: number;
  byCategory: CategoryTotal[];
  totalCount: number;
  inflowCount: number;
  outflowCount: number;
  aiResolvedCount: number;
  aiResolvedPercent: number;
  avgResolutionMs: number;
}

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
