import { useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  emailVerified: boolean;
  createdAt: string;
}

interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users", { credentials: "include" });

        if (!res.ok) {
          throw new Error(`Failed to fetch users (${res.status})`);
        }

        const data = await res.json();

        if (!cancelled) {
          setUsers(data.users);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  return { users, isLoading, error };
}
