import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../../lib/auth-client";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import Spinner from "../ui/Spinner";

export default function AdminRoute() {
  const { isPending } = useSession();
  const isAdmin = useIsAdmin();

  if (isPending) {
    return <Spinner />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
