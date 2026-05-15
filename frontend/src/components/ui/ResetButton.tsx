interface ResetButtonProps {
  onClick: () => void;
  "aria-label"?: string;
}

export default function ResetButton({
  onClick,
  "aria-label": ariaLabel = "Reset",
}: ResetButtonProps) {
  return (
    <button
      onClick={onClick}
      className="ml-auto border border-hairline-glow bg-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors duration-150 hover:border-red hover:text-red"
      aria-label={ariaLabel}
    >
      ✕ RESET
    </button>
  );
}
