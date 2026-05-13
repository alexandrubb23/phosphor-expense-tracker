import { useNavigate } from "react-router-dom";
import { signOut } from "../../lib/auth-client";

export default function SignOutButton() {
  const navigate = useNavigate();

  return (
    <button
      className="signout-btn"
      onClick={() =>
        signOut({
          fetchOptions: {
            onSuccess: () => navigate("/login", { replace: true }),
          },
        })
      }
      title="Sign out"
    >
      SIGN OUT
    </button>
  );
}
