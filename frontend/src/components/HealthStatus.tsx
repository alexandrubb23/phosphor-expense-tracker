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

  return (
    <footer className="health-status">
      <span className={`health-dot health-dot--${state}`} />
      <span className="health-label">{label}</span>
    </footer>
  );
}

export default HealthStatus;
