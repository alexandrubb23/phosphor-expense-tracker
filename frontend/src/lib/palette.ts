/**
 * Design-system color palette.
 * All fixed hex values used across the app live here.
 * Theme-reactive accent colors are handled via CSS custom properties (--color-purple, etc.).
 */
export enum Palette {
  // ── Accent: Purple (default theme) ────────────────────────────────────────
  Purple = "#bf5fff",
  PurpleBright = "#d8a5ff",
  PurpleDim = "#8820cc",

  // ── Accent: Cyan ──────────────────────────────────────────────────────────
  Cyan = "#00e5ff",
  CyanBright = "#5cf3ff",

  // ── Semantic ──────────────────────────────────────────────────────────────
  Amber = "#ffb84a",
  Green = "#4dffaa",
  Red = "#ff3a5c",

  // ── Structural (used in SVG / chart props) ────────────────────────────────
  Hairline = "#1a2535",
  HairlineGlow = "#2a4055",
  Muted = "#5a7080",

  // ── Category-specific visualization colors ────────────────────────────────
  VioletSoft = "#a78bff",
  Pink = "#ff6eb4",
  GreenSoft = "#7ee8a2",
  Yellow = "#ffd166",
  Teal = "#06d6a0",
  PurpleSoft = "#c77dff",
  Orange = "#ff9a3c",
}

/**
 * Design-system theme color token names.
 * Values match Tailwind utility suffixes and CSS custom property names
 * (e.g. ThemeColor.Purple → "purple" → `text-purple` / `--color-purple`).
 */
export enum ThemeColor {
  Purple = "purple",
  Cyan = "cyan",
  Amber = "amber",
  Green = "green",
  Red = "red",
  Muted = "muted",
  Ink = "ink",
}
