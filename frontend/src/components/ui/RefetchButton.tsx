import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

const MIN_SPIN_MS = 700;

interface RefetchButtonProps {
  onClick: () => void;
}

export default function RefetchButton({ onClick }: RefetchButtonProps) {
  const [spinning, setSpinning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleClick = () => {
    setSpinning(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSpinning(false), MIN_SPIN_MS);
    onClick();
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <button
      onClick={handleClick}
      className="inline-flex h-6 w-6 items-center justify-center border border-hairline-glow bg-transparent text-muted transition-all duration-200 hover:border-purple hover:bg-purple hover:text-bg-deep hover:shadow-[0_0_16px_var(--accent-glow-50)]"
      aria-label="Refetch"
      title="Refetch"
    >
      <RefreshCw size={11} className={spinning ? "animate-spin" : ""} />
    </button>
  );
}
