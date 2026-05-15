import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type TransactionSort,
  type TransactionFilter,
  type TransactionPagination,
  type TransactionSummaryQuery,
  type CreateTransaction,
  type UpdateTransaction,
} from "@expense-tracker/core";
import { transactionsApi, type Transaction } from "@/api/transactions";

export type { Transaction };

export const transactionsQueryKey = (
  sort?: TransactionSort,
  filter?: TransactionFilter,
  pagination?: TransactionPagination
) => ["transactions", sort, filter, pagination] as const;

export function useTransactions(
  sort?: TransactionSort,
  filter?: TransactionFilter,
  pagination?: TransactionPagination
) {
  return useQuery({
    queryKey: transactionsQueryKey(sort, filter, pagination),
    queryFn: ({ signal }) =>
      transactionsApi.fetchAll(sort, filter, pagination, signal),
  });
}

export function useTransactionSummary(query: TransactionSummaryQuery) {
  return useQuery({
    queryKey: ["transactions", "summary", query],
    queryFn: ({ signal }) => transactionsApi.fetchSummary(query, signal),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransaction) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransaction }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
