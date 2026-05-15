import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  OperationType,
  Category,
  Currency,
  TransactionStatus,
} from "@expense-tracker/core";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { transactionFormSchema } from "./transactionFormSchema";

const today = () => new Date().toISOString().slice(0, 10);

// Extend the shared schema with `currency` (only needed for creating a transaction)
const formSchema = transactionFormSchema.extend({
  currency: z.enum(Currency),
});

type FormFields = z.infer<typeof formSchema>;

const inputClass = (invalid: boolean) =>
  [
    "w-full bg-surface px-4.5 py-5 font-mono text-sm tracking-[0.02em] text-ink transition-colors duration-200",
    "focus:bg-panel-raised focus:outline-none",
    "placeholder:text-[11px] placeholder:normal-case placeholder:tracking-[0.15em] placeholder:text-muted",
    invalid
      ? "bg-[rgba(255,58,92,0.06)] text-red shadow-[inset_0_0_0_1px_#ff3a5c] placeholder:text-red placeholder:opacity-70"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

const selectClass =
  "w-full cursor-pointer appearance-none bg-surface px-4.5 py-5 pr-10 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors duration-200 focus:bg-panel-raised focus:outline-none";

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full bg-surface">
      {children}
      <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-cyan">
        ⌄
      </span>
    </div>
  );
}

export default function TransactionForm() {
  const { mutateAsync: createTransaction } = useCreateTransaction();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: undefined,
      operationType: OperationType.Outflow,
      category: Category.Food,
      date: today(),
      currency: Currency.RON,
      status: TransactionStatus.Confirmed,
    },
  });

  const onSubmit = async (data: FormFields) => {
    try {
      await createTransaction({ ...data, date: new Date(data.date) });
      reset();
    } catch (err) {
      setError("root", {
        message: getErrorMessage(err, "Failed to create transaction"),
      });
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="relative grid grid-cols-[2.4fr_1fr_1fr_1fr_1fr_auto] gap-px border border-hairline-glow bg-hairline transition-all duration-300 focus-within:border-cyan focus-within:shadow-[0_0_0_1px_#0098b5,0_0_32px_rgba(0,229,255,0.08)] max-sm:grid-cols-[1fr_1fr]"
      >
        <span className="pointer-events-none absolute -top-0.5 -left-0.5 h-2.5 w-2.5 border border-cyan border-r-0 border-b-0 opacity-0 transition-opacity duration-300 focus-within:opacity-100" />
        <span className="pointer-events-none absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 border border-cyan border-l-0 border-t-0 opacity-0 transition-opacity duration-300 focus-within:opacity-100" />

        {/* Hidden fields */}
        <input type="hidden" {...register("currency")} />
        <input type="hidden" {...register("status")} />

        <input
          type="text"
          placeholder="▸ describe entry"
          aria-invalid={!!errors.description}
          className={inputClass(!!errors.description)}
          {...register("description")}
        />
        <input
          type="number"
          placeholder="▸ amount"
          min="0.01"
          step="0.01"
          aria-invalid={!!errors.amount}
          className={inputClass(!!errors.amount)}
          {...register("amount", { valueAsNumber: true })}
        />
        <SelectWrapper>
          <select className={selectClass} {...register("operationType")}>
            {Object.values(OperationType).map((op) => (
              <option
                key={op}
                value={op}
                className="bg-panel-raised text-ink font-mono"
              >
                {op}
              </option>
            ))}
          </select>
        </SelectWrapper>
        <SelectWrapper>
          <select className={selectClass} {...register("category")}>
            {Object.values(Category).map((cat) => (
              <option
                key={cat}
                value={cat}
                className="bg-panel-raised text-ink font-mono"
              >
                {cat}
              </option>
            ))}
          </select>
        </SelectWrapper>
        <input
          type="date"
          aria-invalid={!!errors.date}
          className={inputClass(!!errors.date)}
          {...register("date")}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="whitespace-nowrap bg-cyan px-9 py-5 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-bg-deep transition-all duration-200 hover:bg-cyan-bright hover:tracking-[0.34em] hover:shadow-[0_0_36px_rgba(0,229,255,0.5),inset_0_0_16px_rgba(255,255,255,0.3)] active:bg-cyan-dim disabled:cursor-not-allowed disabled:opacity-50 max-sm:col-span-full"
        >
          {isSubmitting ? "TRANSMITTING…" : "▸ Transmit"}
        </button>
      </form>

      {(errors.description || errors.amount || errors.date || errors.root) && (
        <div
          className="mt-3.5 flex flex-col gap-1.5 border border-red bg-[rgba(255,58,92,0.06)] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-red [text-shadow:0_0_10px_rgba(255,58,92,0.5)]"
          role="alert"
          aria-live="polite"
        >
          {errors.description && <div>▸ {errors.description.message}</div>}
          {errors.amount && <div>▸ {errors.amount.message}</div>}
          {errors.date && <div>▸ {errors.date.message}</div>}
          {errors.root && <div>▸ {errors.root.message}</div>}
        </div>
      )}
    </div>
  );
}
