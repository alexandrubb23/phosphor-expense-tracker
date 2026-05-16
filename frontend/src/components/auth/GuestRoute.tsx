import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../../lib/auth-client";
import Spinner from "../ui/Spinner";

export default function GuestRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <Spinner />;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
