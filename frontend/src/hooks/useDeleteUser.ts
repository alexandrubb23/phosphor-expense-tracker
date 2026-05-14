import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/users";
import { usersQueryKey } from "@/hooks/useUsers";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}
