import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function DeleteButton({
  label,
  onClick,
  disabled = false,
}: DeleteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Delete ${label}`}
      disabled={disabled}
      className="text-muted transition-colors duration-200 hover:text-red disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Trash2 size={14} />
    </button>
  );
}
