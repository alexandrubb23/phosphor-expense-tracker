import { Category } from "@expense-tracker/core";

export const CATEGORY_COLORS: Record<string, string> = {
  [Category.Food]: "#00e5ff",
  [Category.Housing]: "#4dffaa",
  [Category.Utilities]: "#ffb84a",
  [Category.Transport]: "#a78bff",
  [Category.Entertainment]: "#ff3a5c",
  [Category.Salary]: "#5cf3ff",
  [Category.Other]: "#5a7080",
};

export const CATEGORY_COLOR_FALLBACK = Object.values(CATEGORY_COLORS);
