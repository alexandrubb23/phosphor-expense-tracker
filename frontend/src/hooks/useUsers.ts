import { useQuery } from "@tanstack/react-query";
import { usersApi, type User } from "@/api/users";

export type { User };

export const usersQueryKey = ["admin", "users"] as const;

export function useUsers() {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: () => usersApi.fetchUsers(),
  });
}
