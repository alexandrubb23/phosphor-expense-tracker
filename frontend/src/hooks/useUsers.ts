import { useQuery } from "@tanstack/react-query";
import { usersApi, type User } from "@/api/users";

export type { User };

export function useUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => usersApi.fetchUsers(),
  });
}
