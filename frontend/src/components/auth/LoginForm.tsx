import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "../../lib/auth-client";
import FormField from "../ui/FormField";
import ErrorMessage, { ERROR_VARIANTS } from "../ui/ErrorMessage";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Access code is required"),
});

type LoginFields = z.infer<typeof loginSchema>;

const Field = FormField<LoginFields>;

export default function LoginForm() {
  const navigate = useNavigate();

  const methods = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const {
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async ({ email, password }: LoginFields) => {
    try {
      const result = await signIn.email({ email, password });

      if (result.error) {
        setError("root", {
          message:
            result.error.message ??
            "Authentication failed. Check your credentials.",
        });
        return;
      }

      navigate("/", { replace: true, state: { fromLogin: true } });
    } catch {
      setError("root", {
        message: "Could not reach the server. Is the backend running?",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
        <Field
          name="email"
          label="EMAIL ADDRESS"
          type="email"
          placeholder="OPERATOR@DOMAIN.COM"
          autoComplete="email"
          autoFocus
        />

        <Field
          name="password"
          label="ACCESS CODE"
          type="password"
          placeholder="••••••••••••"
          autoComplete="current-password"
        />

        <ErrorMessage
          message={errors.root?.message}
          variant={ERROR_VARIANTS[1]}
        />

        <button type="submit" className="login-submit" disabled={isSubmitting}>
          {isSubmitting ? "AUTHENTICATING…" : "AUTHENTICATE"}
        </button>
      </form>
    </FormProvider>
  );
}
