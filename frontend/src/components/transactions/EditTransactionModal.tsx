import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  OperationType,
  Category,
  TransactionStatus,
} from "@expense-tracker/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { type Transaction } from "@/api/transactions";
import { useUpdateTransaction } from "@/hooks/useTransactions";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  transactionFormSchema,
  type TransactionFormFields,
} from "./transactionFormSchema";

type EditFields = TransactionFormFields;

const inputClass = (invalid: boolean) =>
  [
    "w-full bg-panel px-4 py-3 font-mono text-sm tracking-[0.02em] text-ink transition-colors duration-200",
    "focus:bg-panel-raised focus:outline-none focus:shadow-[inset_0_0_0_1px_var(--color-purple)]",
    "placeholder:text-[11px] placeholder:tracking-[0.15em] placeholder:text-muted",
    invalid
      ? "bg-[rgba(255,58,92,0.06)] text-red shadow-[inset_0_0_0_1px_#ff3a5c]"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

const selectClass =
  "w-full cursor-pointer appearance-none bg-panel px-4 py-3 pr-10 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors duration-200 focus:bg-panel-raised focus:outline-none focus:shadow-[inset_0_0_0_1px_var(--color-purple)]";

const labelClass =
  "block font-mono text-[10px] uppercase tracking-[0.22em] text-purple mb-1.5";

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-panel">
      {children}
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-purple text-xs">
        ⌄
      </span>
    </div>
  );
}

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function EditTransactionModal({
  transaction,
  onClose,
}: EditTransactionModalProps) {
  const { mutateAsync: updateTransaction } = useUpdateTransaction();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditFields>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: transaction.description,
      amount: Number(transaction.amount),
      operationType: transaction.operationType,
      category: transaction.category,
      date: transaction.date.slice(0, 10),
      status: transaction.status,
    },
  });

  const onSubmit = async (data: EditFields) => {
    setServerError(null);
    try {
      await updateTransaction({ id: transaction.id, data });
      onClose();
    } catch (err) {
      setServerError(getErrorMessage(err, "Failed to update transaction"));
    }
  };

  const hasErrors =
    errors.description || errors.amount || errors.date || serverError;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-none border border-hairline-glow bg-surface p-8 shadow-[0_0_60px_var(--accent-glow-08)]">
        {/* Corner accents */}
        <span className="pointer-events-none absolute -top-px -left-px h-3 w-3 border-t border-l border-purple" />
        <span className="pointer-events-none absolute -right-px -bottom-px h-3 w-3 border-b border-r border-purple" />

        <DialogHeader className="mb-6 flex flex-row items-center justify-between gap-0 place-items-start text-left">
          <DialogTitle className="font-mono text-[13px] font-medium uppercase tracking-[0.22em] text-ink">
            Edit Transaction
          </DialogTitle>
          <DialogClose
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
            className="h-auto p-0 font-mono text-[11px] tracking-[0.2em] text-muted hover:bg-transparent hover:text-purple"
          >
            ✕ CLOSE
          </DialogClose>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div>
            <label className={labelClass}>Description</label>
            <input
              type="text"
              aria-invalid={!!errors.description}
              className={inputClass(!!errors.description)}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                aria-invalid={!!errors.amount}
                className={inputClass(!!errors.amount)}
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                aria-invalid={!!errors.date}
                className={inputClass(!!errors.date)}
                {...register("date")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type</label>
              <SelectWrapper>
                <select className={selectClass} {...register("operationType")}>
                  {Object.values(OperationType).map((op) => (
                    <option key={op} value={op} className="bg-panel-raised">
                      {op}
                    </option>
                  ))}
                </select>
              </SelectWrapper>
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <SelectWrapper>
                <select className={selectClass} {...register("category")}>
                  {Object.values(Category).map((cat) => (
                    <option key={cat} value={cat} className="bg-panel-raised">
                      {cat}
                    </option>
                  ))}
                </select>
              </SelectWrapper>
            </div>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <SelectWrapper>
              <select className={selectClass} {...register("status")}>
                {Object.values(TransactionStatus).map((s) => (
                  <option key={s} value={s} className="bg-panel-raised">
                    {s}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>

          {hasErrors && (
            <div
              role="alert"
              aria-live="polite"
              className="flex flex-col gap-1 border border-red bg-[rgba(255,58,92,0.06)] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-red [text-shadow:0_0_10px_rgba(255,58,92,0.5)]"
            >
              {errors.description && <div>▸ {errors.description.message}</div>}
              {errors.amount && <div>▸ {errors.amount.message}</div>}
              {errors.date && <div>▸ {errors.date.message}</div>}
              {serverError && <div>▸ {serverError}</div>}
            </div>
          )}

          <div className="mt-2 flex gap-3">
            <DialogClose
              disabled={isSubmitting}
              className="flex-1 rounded-none border border-hairline bg-transparent py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-muted hover:border-purple hover:bg-transparent hover:text-purple disabled:cursor-not-allowed disabled:opacity-50"
            >
              CANCEL
            </DialogClose>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-bg-deep transition-all duration-200 hover:bg-purple-bright disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "SAVING…" : "▸ Save"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
