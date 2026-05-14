import { Role } from "@expense-tracker/core";
import { useSession } from "../lib/auth-client";

export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  return session?.user?.role === Role.admin;
}
