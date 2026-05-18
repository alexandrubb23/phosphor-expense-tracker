import { useFormContext, FieldValues, Path } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

export default function FormField<T extends FieldValues = FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  autoFocus,
}: FormFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];

  return (
    <div className="flex flex-col gap-2">
      <label
        className="font-mono text-[10px] uppercase tracking-[0.28em] text-purple"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        className="w-full border border-hairline-glow bg-surface px-4 py-3.5 font-mono text-sm tracking-[0.04em] text-ink transition-all duration-200
          placeholder:text-[11px] placeholder:tracking-[0.14em] placeholder:text-muted-soft
          focus:border-purple focus:bg-panel-raised focus:outline-none focus:shadow-[0_0_0_1px_var(--accent-ring),0_0_24px_var(--accent-glow-08)]
          aria-invalid:border-red aria-invalid:bg-[rgba(255,58,92,0.04)] aria-invalid:shadow-[0_0_0_1px_#ff3a5c]"
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={!!error}
        {...register(name)}
      />
      <ErrorMessage message={error?.message as string | undefined} />
    </div>
  );
}
