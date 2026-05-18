import { ThemeColor } from "@/lib/palette";
import type { AccentColor } from "@/hooks/useAccentColor";

const STORAGE_KEY = "accent-color";
const DEFAULT: AccentColor = ThemeColor.Purple;

export const accentColorStorage = {
  DEFAULT,

  get(): AccentColor {
    return (localStorage.getItem(STORAGE_KEY) as AccentColor | null) ?? DEFAULT;
  },

  set(color: AccentColor): void {
    localStorage.setItem(STORAGE_KEY, color);
  },
};
