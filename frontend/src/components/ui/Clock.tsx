import { useState, useEffect } from "react";
import { formatTime } from "@/lib/time";

function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <span className="font-medium text-ink [font-variant-numeric:tabular-nums]">
      <span className="mr-2 font-normal text-muted">T:</span>
      {formatTime(now)}
    </span>
  );
}

export default Clock;
