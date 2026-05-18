import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-7 w-7 items-center justify-center border border-hairline-glow text-ink-soft transition-colors duration-200 hover:border-purple hover:text-purple"
    >
      {isDark ? <Sun size={13} /> : <Moon size={13} />}
    </button>
  );
}
