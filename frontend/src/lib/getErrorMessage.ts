import { AxiosError } from "axios";

/**
 * Extracts a human-readable error message from an unknown thrown value.
 * Reads `response.data.error` from AxiosError responses; falls back to `fallback`.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    return (err.response?.data?.error as string | undefined) ?? fallback;
  }
  return fallback;
}
