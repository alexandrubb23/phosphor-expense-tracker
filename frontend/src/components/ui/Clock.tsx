import { useState, useEffect } from "react";

function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const utc = now.toISOString().slice(11, 19);

  return (
    <span className="masthead-clock">
      <span className="label">T:</span>
      {utc} UTC
    </span>
  );
}

export default Clock;
