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
      <div className="login-error" role="alert">
        ⚠ {message.toUpperCase()}
      </div>
    );
  }

  return (
    <span className="login-field-error" role="alert">
      {message.toUpperCase()}
    </span>
  );
}
