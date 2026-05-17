const CURRENCY_CODE = import.meta.env.VITE_CURRENCY ?? "RON";

/**
 * Locale used for number/currency formatting.
 * Resolution order:
 *   1. VITE_LOCALE env var  (operator-configured, e.g. "ro-RO")
 *   2. navigator.language   (browser's locale, e.g. "en-US")
 *   3. "en-US"              (safe fallback)
 */
const LOCALE: string =
  import.meta.env.VITE_LOCALE ??
  (typeof navigator !== "undefined" ? navigator.language : undefined) ??
  "en-US";

export { CURRENCY_CODE, LOCALE };

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
