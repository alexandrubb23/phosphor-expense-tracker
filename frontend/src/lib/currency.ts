const CURRENCY_CODE = import.meta.env.VITE_CURRENCY ?? "RON";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default CURRENCY_CODE;
