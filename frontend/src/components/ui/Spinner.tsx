export default function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple/20 border-t-purple shadow-[0_0_16px_var(--accent-glow-50)]" />
    </div>
  );
}
