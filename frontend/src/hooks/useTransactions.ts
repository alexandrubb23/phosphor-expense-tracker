import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type TransactionSort,
  type TransactionFilter,
} from "@expense-tracker/core";
import { transactionsApi, type Transaction } from "@/api/transactions";

export type { Transaction };

export const transactionsQueryKey = (
  sort?: TransactionSort,
  filter?: TransactionFilter
) => ["transactions", sort, filter] as const;

export function useTransactions(
  sort?: TransactionSort,
  filter?: TransactionFilter
) {
  return useQuery({
    queryKey: transactionsQueryKey(sort, filter),
    queryFn: ({ signal }) => transactionsApi.fetchAll(sort, filter, signal),
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
