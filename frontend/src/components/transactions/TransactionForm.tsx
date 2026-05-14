import { useState } from "react";
import { NewTransaction } from "../../types";

interface TransactionFormProps {
  categories: string[];
  onAdd: (transaction: NewTransaction) => void;
}

interface FormErrors {
  description?: string;
  amount?: string;
}

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full bg-surface">
      <select
        value={value}
        className="w-full cursor-pointer appearance-none bg-surface px-4.5 py-5 pr-10 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors duration-200 focus:bg-panel-raised focus:outline-none"
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-cyan">
        ⌄
      </span>
    </div>
  );
}

function TransactionForm({ categories, onAdd }: TransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("food");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      next.description = "Description is required";
    } else if (trimmedDescription.length > 80) {
      next.description = "Description must be 80 characters or fewer";
    }
    const parsedAmount = Number(amount);
    if (amount.trim() === "") {
      next.amount = "Amount is required";
    } else if (!Number.isFinite(parsedAmount)) {
      next.amount = "Amount must be a number";
    } else if (parsedAmount <= 0) {
      next.amount = "Amount must be greater than 0";
    }
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onAdd({
      description: description.trim(),
      amount: Number(amount),
      type,
      category,
      date: new Date().toISOString().split("T")[0],
    });
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("food");
    setErrors({});
  };

  const clearError = (field: keyof FormErrors) => {
    if (!errors[field]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const hasErrors = Object.keys(errors).length > 0;

  const inputClass = (invalid: boolean) =>
    `w-full bg-surface px-4.5 py-5 font-mono text-sm tracking-[0.02em] text-ink transition-colors duration-200 focus:bg-panel-raised focus:outline-none
    placeholder:text-[11px] placeholder:normal-case placeholder:tracking-[0.15em] placeholder:text-muted
    ${invalid ? "bg-[rgba(255,58,92,0.06)] text-red shadow-[inset_0_0_0_1px_#ff3a5c] placeholder:text-red placeholder:opacity-70" : ""}`;

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative grid grid-cols-[2.4fr_1fr_1fr_1fr_auto] gap-px border border-hairline-glow bg-hairline transition-all duration-300 focus-within:border-cyan focus-within:shadow-[0_0_0_1px_#0098b5,0_0_32px_rgba(0,229,255,0.08)] max-sm:grid-cols-[1fr_1fr]"
      >
        <span className="pointer-events-none absolute -top-0.5 -left-0.5 h-2.5 w-2.5 border border-cyan border-r-0 border-b-0 opacity-0 transition-opacity duration-300 focus-within:opacity-100" />
        <span className="pointer-events-none absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 border border-cyan border-l-0 border-t-0 opacity-0 transition-opacity duration-300 focus-within:opacity-100" />
        <input
          type="text"
          placeholder="▸ describe entry"
          value={description}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? "error-description" : undefined
          }
          className={inputClass(!!errors.description)}
          onChange={(e) => {
            setDescription(e.target.value);
            clearError("description");
          }}
        />
        <input
          type="number"
          placeholder="▸ amount"
          value={amount}
          min="0.01"
          step="0.01"
          aria-invalid={!!errors.amount}
          aria-describedby={errors.amount ? "error-amount" : undefined}
          className={inputClass(!!errors.amount)}
          onChange={(e) => {
            setAmount(e.target.value);
            clearError("amount");
          }}
        />
        <SelectField
          value={type}
          onChange={(value) => setType(value as "income" | "expense")}
        >
          <option value="income" className="bg-panel-raised text-ink font-mono">
            Inflow
          </option>
          <option
            value="expense"
            className="bg-panel-raised text-ink font-mono"
          >
            Outflow
          </option>
        </SelectField>
        <SelectField value={category} onChange={setCategory}>
          {categories.map((cat) => (
            <option
              key={cat}
              value={cat}
              className="bg-panel-raised text-ink font-mono"
            >
              {cat}
            </option>
          ))}
        </SelectField>
        <button
          type="submit"
          className="whitespace-nowrap bg-cyan px-9 py-5 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-bg-deep transition-all duration-200 hover:bg-cyan-bright hover:tracking-[0.34em] hover:shadow-[0_0_36px_rgba(0,229,255,0.5),inset_0_0_16px_rgba(255,255,255,0.3)] active:bg-cyan-dim max-sm:col-span-full"
        >
          ▸ Transmit
        </button>
      </form>

      {hasErrors && (
        <div
          className="mt-3.5 flex flex-col gap-1.5 border border-red bg-[rgba(255,58,92,0.06)] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-red [text-shadow:0_0_10px_rgba(255,58,92,0.5)]"
          role="alert"
          aria-live="polite"
        >
          {errors.description && (
            <div id="error-description">▸ {errors.description}</div>
          )}
          {errors.amount && <div id="error-amount">▸ {errors.amount}</div>}
        </div>
      )}
    </div>
  );
}

export default TransactionForm;
