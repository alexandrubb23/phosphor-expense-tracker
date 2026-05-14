import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type NewUser } from "@/api/users";
import { usersQueryKey } from "@/hooks/useUsers";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newUser: NewUser) => usersApi.createUser(newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}
