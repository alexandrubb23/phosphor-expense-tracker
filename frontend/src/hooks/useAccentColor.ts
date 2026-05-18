import { useEffect, useState } from "react";
import { ThemeColor } from "@/lib/palette";
import { accentColorStorage } from "@/services/accentColorStorage";

export type AccentColor =
  | ThemeColor.Purple
  | ThemeColor.Cyan
  | ThemeColor.Amber
  | ThemeColor.Green;

export function useAccentColor() {
  const [accent, setAccentState] = useState<AccentColor>(() =>
    accentColorStorage.get()
  );

  useEffect(() => {
    const html = document.documentElement;
    if (accent === accentColorStorage.DEFAULT) {
      html.removeAttribute("data-accent");
    } else {
      html.setAttribute("data-accent", accent);
    }
    accentColorStorage.set(accent);
  }, [accent]);

  // Apply on mount (before first paint when possible)
  useEffect(() => {
    const stored = accentColorStorage.get();
    if (stored !== accentColorStorage.DEFAULT) {
      document.documentElement.setAttribute("data-accent", stored);
    }
  }, []);

  return { accent, setAccent: setAccentState };
}
