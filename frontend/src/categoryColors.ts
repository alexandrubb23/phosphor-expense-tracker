import { Category } from "@expense-tracker/core";
import { Palette } from "@/lib/palette";

export const CATEGORY_COLORS: Record<string, string> = {
  [Category.Food]: Palette.Cyan,
  [Category.Housing]: Palette.Green,
  [Category.Utilities]: Palette.Amber,
  [Category.Transport]: Palette.VioletSoft,
  [Category.Entertainment]: Palette.Red,
  [Category.Salary]: Palette.CyanBright,
  [Category.Other]: Palette.Muted,
  [Category.Healthcare]: Palette.Pink,
  [Category.Education]: Palette.GreenSoft,
  [Category.Shopping]: Palette.Yellow,
  [Category.Travel]: Palette.Teal,
  [Category.Insurance]: Palette.PurpleSoft,
  [Category.Subscriptions]: Palette.Orange,
};

export const CATEGORY_COLOR_FALLBACK = Object.values(CATEGORY_COLORS);
