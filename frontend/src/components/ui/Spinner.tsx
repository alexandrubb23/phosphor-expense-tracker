export default function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan/20 border-t-cyan shadow-[0_0_16px_rgba(0,229,255,0.5)]" />
    </div>
  );
}
