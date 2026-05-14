interface FormRootErrorProps {
  message?: string;
}

export default function FormRootError({ message }: FormRootErrorProps) {
  if (!message) return null;

  return (
    <div
      className="border border-red bg-[rgba(255,58,92,0.06)] px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-red [text-shadow:0_0_10px_rgba(255,58,92,0.5)]"
      role="alert"
    >
      ⚠ {message.toUpperCase()}
    </div>
  );
}
