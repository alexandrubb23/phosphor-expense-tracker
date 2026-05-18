import { NavLink } from "react-router-dom";

interface NavButtonProps {
  to: string;
  children: React.ReactNode;
}

export default function NavButton({ to, children }: NavButtonProps) {
  return (
    <NavLink
      to={to}
      className="border border-hairline-glow bg-transparent px-3 py-1.25 font-mono text-[10px] uppercase tracking-[0.22em] text-muted
        transition-all duration-200
        hover:border-purple hover:text-purple hover:shadow-[0_0_10px_var(--accent-glow-30)]"
    >
      {children}
    </NavLink>
  );
}
