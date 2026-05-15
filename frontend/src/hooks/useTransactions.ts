import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionsApi, type Transaction } from "@/api/transactions";

export type { Transaction };

export const transactionsQueryKey = ["transactions"] as const;

export function useTransactions() {
  return useQuery({
    queryKey: transactionsQueryKey,
    queryFn: () => transactionsApi.fetchAll(),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionsQueryKey });
    },
  });
}
