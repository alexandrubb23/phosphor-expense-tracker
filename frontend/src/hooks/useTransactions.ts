import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type TransactionSort } from "@expense-tracker/core";
import { transactionsApi, type Transaction } from "@/api/transactions";

export type { Transaction };

export const transactionsQueryKey = (sort?: TransactionSort) =>
  ["transactions", sort] as const;

export function useTransactions(sort?: TransactionSort) {
  return useQuery({
    queryKey: transactionsQueryKey(sort),
    queryFn: () => transactionsApi.fetchAll(sort),
  });
}

export function useDeleteTransaction(sort?: TransactionSort) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionsQueryKey(sort) });
    },
  });
}
