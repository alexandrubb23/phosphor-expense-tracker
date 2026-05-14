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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
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

        <button
          type="submit"
          className="mt-2 bg-cyan py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-bg-deep transition-all duration-200
            hover:bg-cyan-bright hover:tracking-[0.38em] hover:shadow-[0_0_36px_rgba(0,229,255,0.5),inset_0_0_16px_rgba(255,255,255,0.3)]
            disabled:cursor-not-allowed disabled:opacity-50 disabled:tracking-[0.2em]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "AUTHENTICATING…" : "AUTHENTICATE"}
        </button>
      </form>
    </FormProvider>
  );
}
