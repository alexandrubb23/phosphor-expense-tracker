import { useState, useEffect } from "react";

interface HealthResponse {
  status: string;
  timestamp: string;
}

type ConnectionState = "checking" | "online" | "offline";

function HealthStatus() {
  const [state, setState] = useState<ConnectionState>("checking");
  const [timestamp, setTimestamp] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      setState("checking");
      try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error("Non-OK response");
        const data: HealthResponse = await res.json();
        setTimestamp(data.timestamp);
        setState("online");
      } catch {
        setState("offline");
      }
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  const label =
    state === "checking"
      ? "PINGING..."
      : state === "online"
        ? `API ONLINE · ${timestamp ? new Date(timestamp).toISOString().slice(11, 19) + " UTC" : ""}`
        : "API UNREACHABLE";

  const dotClass =
    state === "checking"
      ? "bg-amber animate-pulse-dot"
      : state === "online"
        ? "bg-green shadow-[0_0_6px_rgba(77,255,170,0.4)]"
        : "bg-red shadow-[0_0_6px_rgba(255,58,92,0.5)]";

  return (
    <footer className="mt-16 flex items-center gap-2 rounded-xs border border-hairline bg-surface px-4 py-2.5 font-mono text-[11px] tracking-[0.08em] text-muted">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
      <span className="text-ink-soft">{label}</span>
    </footer>
  );
}

export default HealthStatus;
