import { useState } from "react";
import { AxiosError } from "axios";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ConfirmDeleteModalProps {
  title: string;
  entityName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  fallbackError?: string;
}

export default function ConfirmDeleteModal({
  title,
  entityName,
  onConfirm,
  onClose,
  fallbackError = "Failed to delete",
}: ConfirmDeleteModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setIsPending(true);
      await onConfirm();
      onClose();
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? ((err.response?.data?.error as string | undefined) ?? fallbackError)
          : fallbackError;
      setError(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md rounded-none border border-hairline-glow bg-surface p-8 shadow-[0_0_60px_rgba(0,229,255,0.08)]">
        {/* Corner accents */}
        <span className="pointer-events-none absolute -top-px -left-px h-3 w-3 border-t border-l border-red" />
        <span className="pointer-events-none absolute -right-px -bottom-px h-3 w-3 border-b border-r border-red" />

        <AlertDialogHeader className="mb-6 flex flex-row items-center justify-between gap-0 place-items-start text-left">
          <AlertDialogTitle className="font-mono text-[13px] font-medium uppercase tracking-[0.22em] text-ink">
            {title}
          </AlertDialogTitle>
          <AlertDialogCancel
            variant="ghost"
            size="sm"
            disabled={isPending}
            className="h-auto p-0 font-mono text-[11px] tracking-[0.2em] text-muted hover:bg-transparent hover:text-cyan"
          >
            ✕ CLOSE
          </AlertDialogCancel>
        </AlertDialogHeader>

        <AlertDialogDescription className="font-body text-sm text-ink-soft">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-ink">{entityName}</span>?{" "}
          <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            This action cannot be undone.
          </span>
        </AlertDialogDescription>

        {error && (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-red">
            ⚠ {error}
          </p>
        )}

        <AlertDialogFooter className="mx-0 mb-0 mt-6 flex-row rounded-none border-0 bg-transparent p-0">
          <AlertDialogCancel
            disabled={isPending}
            className="flex-1 rounded-none border border-hairline bg-transparent py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-muted hover:border-cyan hover:bg-transparent hover:text-cyan disabled:cursor-not-allowed disabled:opacity-50"
          >
            CANCEL
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 rounded-none bg-red py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-bg-deep hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "DELETING…" : "▸ DELETE"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
