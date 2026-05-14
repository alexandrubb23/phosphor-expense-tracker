import { useState, useEffect } from "react";

function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const utc = now.toISOString().slice(11, 19);

  return (
    <span className="font-medium text-ink [font-variant-numeric:tabular-nums]">
      <span className="mr-2 font-normal text-muted">T:</span>
      {utc} UTC
    </span>
  );
}

export default Clock;
