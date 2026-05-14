interface SectionHeadProps {
  eyebrow: string;
  title: string;
  status: React.ReactNode;
}

export default function SectionHead({
  eyebrow,
  title,
  status,
}: SectionHeadProps) {
  return (
    <div className="relative mb-7 flex items-center gap-5 border-b border-hairline-glow pb-3.5">
      <span className="absolute -bottom-px left-0 h-px w-20 bg-cyan shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
      <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-cyan">
        {eyebrow}
      </span>
      <h2 className="flex-1 font-mono text-[15px] font-medium leading-none uppercase tracking-[0.18em] text-ink">
        {title}
      </h2>
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
        {status}
      </span>
    </div>
  );
}
