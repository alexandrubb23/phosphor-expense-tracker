import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type EditUser } from "@/api/users";
import { usersQueryKey } from "@/hooks/useUsers";

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EditUser) => usersApi.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}
