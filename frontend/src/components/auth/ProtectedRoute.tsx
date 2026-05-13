import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../../lib/auth-client";

export default function ProtectedRoute() {
  const { data: session, isPending } = useSession();
  const location = useLocation();
  // After a client-side login redirect, Better Auth's session atom may not have
  // updated yet. Give it a brief window (100ms) before treating missing session
  // as "not authenticated" to avoid an instant redirect back to /login.
  const [settling, setSettling] = useState(location.state?.fromLogin === true);

  useEffect(() => {
    if (!settling) return;
    const id = setTimeout(() => setSettling(false), 100);
    return () => clearTimeout(id);
  }, [settling]);

  if (isPending || settling) {
    return (
      <div className="auth-loading">
        <span className="auth-loading-label">AUTHENTICATING</span>
        <span className="auth-loading-dots" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
