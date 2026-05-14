export const ERROR_VARIANTS = ["field", "root"] as const;
export type ErrorVariant = (typeof ERROR_VARIANTS)[number];

interface ErrorMessageProps {
  message?: string;
  variant?: ErrorVariant;
}

export default function ErrorMessage({
  message,
  variant = "field",
}: ErrorMessageProps) {
  if (!message) return null;

  if (variant === ERROR_VARIANTS[1]) {
    return (
      <div
        className="border border-red bg-[rgba(255,58,92,0.06)] px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-red [text-shadow:0_0_10px_rgba(255,58,92,0.5)]"
        role="alert"
      >
        ⚠ {message.toUpperCase()}
      </div>
    );
  }

  return (
    <span
      className="mt-1 block font-mono text-[10px] tracking-[0.14em] text-red [text-shadow:0_0_8px_rgba(255,58,92,0.5)]"
      role="alert"
    >
      {message.toUpperCase()}
    </span>
  );
}
