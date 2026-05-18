import { Pencil } from "lucide-react";

interface EditButtonProps {
  label: string;
  onClick: () => void;
}

export default function EditButton({ label, onClick }: EditButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Edit ${label}`}
      className="text-muted transition-colors duration-200 hover:text-purple"
    >
      <Pencil size={14} />
    </button>
  );
}
