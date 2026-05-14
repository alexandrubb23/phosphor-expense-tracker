import { useSession } from "../lib/auth-client";

export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  return session?.user?.role === "admin";
}
