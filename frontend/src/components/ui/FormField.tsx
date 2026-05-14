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
    <div className="login-field">
      <label className="login-label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        type={type}
        className="login-input"
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
