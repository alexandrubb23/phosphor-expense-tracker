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
        hover:border-cyan hover:text-cyan hover:shadow-[0_0_10px_rgba(0,229,255,0.3)]"
    >
      ▸ New User
    </button>
  );
}
