import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../../lib/auth-client";
import { useIsAdmin } from "../../hooks/useIsAdmin";

export default function AdminRoute() {
  const { isPending } = useSession();
  const isAdmin = useIsAdmin();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3.5 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan">
        <span>AUTHENTICATING</span>
        <span className="animate-blink">...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
