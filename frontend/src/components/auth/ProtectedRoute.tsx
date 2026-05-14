import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../../lib/auth-client";

export default function ProtectedRoute() {
  const { data: session, isPending } = useSession();
  const location = useLocation();
  const [settling, setSettling] = useState(location.state?.fromLogin === true);

  useEffect(() => {
    if (!settling) return;
    const id = setTimeout(() => setSettling(false), 100);
    return () => clearTimeout(id);
  }, [settling]);

  if (isPending || settling) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3.5 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan">
        <span>AUTHENTICATING</span>
        <span className="animate-blink">...</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
