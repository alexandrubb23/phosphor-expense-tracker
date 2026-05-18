interface NewUserButtonProps {
  onClick: () => void;
}

export default function NewUserButton({ onClick }: NewUserButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-hairline-glow bg-transparent px-3 py-1.25 font-mono text-[10px] uppercase tracking-[0.22em] text-muted
        transition-all duration-200
        hover:border-purple hover:text-purple hover:shadow-[0_0_10px_var(--accent-glow-30)]"
    >
      ▸ New User
    </button>
  );
}
