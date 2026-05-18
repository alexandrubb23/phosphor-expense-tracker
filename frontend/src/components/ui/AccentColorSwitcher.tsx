import { type AccentColor, useAccentColor } from "@/hooks/useAccentColor";
import { Palette, ThemeColor } from "@/lib/palette";

const ACCENTS: { id: AccentColor; label: string; color: string }[] = [
  { id: ThemeColor.Purple, label: "Purple", color: Palette.Purple },
  { id: ThemeColor.Cyan, label: "Cyan", color: Palette.Cyan },
  { id: ThemeColor.Amber, label: "Amber", color: Palette.Amber },
  { id: ThemeColor.Green, label: "Green", color: Palette.Green },
];

export default function AccentColorSwitcher() {
  const { accent, setAccent } = useAccentColor();

  return (
    <ul className="flex items-center gap-1.5" aria-label="Accent color">
      {ACCENTS.map(({ id, label, color }) => {
        const active = accent === id;
        return (
          <li key={id}>
            <button
              onClick={() => setAccent(id)}
              aria-label={label}
              aria-pressed={active}
              title={label}
              className="relative h-3.5 w-3.5 rounded-full transition-transform duration-150 hover:scale-125 focus-visible:outline-none"
              style={{ background: color }}
            >
              {active && (
                <span
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    boxShadow: `0 0 8px ${color}, 0 0 0 2px var(--color-bg), 0 0 0 3px ${color}`,
                  }}
                  aria-hidden
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
