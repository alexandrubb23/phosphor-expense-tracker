import Clock from "./Clock";
import { DesktopNav, MobileMenu } from "./MastheadNav";
import ThemeToggle from "./ThemeToggle";

interface MastheadProps {
  sectorLabel: string;
  sectorAccent: string;
  actions?: React.ReactNode;
}

export default function Masthead({
  sectorLabel,
  sectorAccent,
  actions,
}: MastheadProps) {
  const today = new Date();
  const starDate = `FY26.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  return (
    <header className="relative mb-14 flex items-center justify-between rounded-xs border border-hairline bg-surface px-4.5 py-3.5 opacity-0 animate-fade-in [animation-delay:0.05s] max-sm:flex-col max-sm:items-start max-sm:gap-2.5">
      <span className="absolute -top-px -left-px h-2 w-2 bg-cyan shadow-[0_0_12px_rgba(0,229,255,0.5)]" />
      <span className="absolute -right-px -bottom-px h-2 w-2 bg-cyan shadow-[0_0_12px_rgba(0,229,255,0.5)]" />

      <div className="flex items-center gap-5.5 font-mono text-[11px] uppercase tracking-[0.14em]">
        <span className="relative flex items-center border border-cyan-dim px-2.25 py-1 font-medium text-cyan">
          <span className="absolute top-1/2 -left-2 h-1.25 w-1.25 -translate-y-1/2 rounded-full bg-cyan shadow-[0_0_8px_rgba(0,229,255,0.5)] animate-blink" />
          BR-04
        </span>
        <span className="flex items-center gap-2 text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_8px_rgba(77,255,170,0.4)]" />
          SECURE CHANNEL
        </span>
        <Clock />
      </div>

      <div
        className={
          actions
            ? "flex items-center gap-5 max-sm:w-full max-sm:justify-between"
            : "flex items-center gap-3"
        }
      >
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {sectorLabel} <span className="text-cyan">// {sectorAccent}</span> ·{" "}
          {starDate}
        </div>

        <ThemeToggle />

        {actions && <DesktopNav>{actions}</DesktopNav>}
        {actions && <MobileMenu>{actions}</MobileMenu>}
      </div>
    </header>
  );
}
