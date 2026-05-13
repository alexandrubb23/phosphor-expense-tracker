import Clock from "./Clock";

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
    <header className="masthead">
      <div className="masthead-cluster">
        <span className="masthead-tag">BR-04</span>
        <span className="masthead-link">
          <span className="dot" /> SECURE CHANNEL
        </span>
        <Clock />
      </div>
      <div className={actions ? "masthead-right" : undefined}>
        <div className="masthead-sector">
          {sectorLabel} <span className="accent">// {sectorAccent}</span> ·{" "}
          {starDate}
        </div>
        {actions}
      </div>
    </header>
  );
}
