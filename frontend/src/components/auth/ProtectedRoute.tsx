import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../../lib/auth-client";
import Spinner from "../ui/Spinner";

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
    return <Spinner />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
