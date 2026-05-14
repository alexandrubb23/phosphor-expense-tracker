import { useNavigate } from "react-router-dom";
import { signOut } from "../../lib/auth-client";

export default function SignOutButton() {
  const navigate = useNavigate();

  return (
    <button
      className="border border-hairline-glow bg-transparent px-3 py-1.25 font-mono text-[10px] uppercase tracking-[0.22em] text-muted
        transition-all duration-200
        hover:border-red hover:text-red hover:shadow-[0_0_10px_rgba(255,58,92,0.5)]"
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
