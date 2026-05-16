import { Category } from "@expense-tracker/core";

export const CATEGORY_COLORS: Record<string, string> = {
  [Category.Food]: "#00e5ff",
  [Category.Housing]: "#4dffaa",
  [Category.Utilities]: "#ffb84a",
  [Category.Transport]: "#a78bff",
  [Category.Entertainment]: "#ff3a5c",
  [Category.Salary]: "#5cf3ff",
  [Category.Other]: "#5a7080",
  [Category.Healthcare]: "#ff6eb4",
  [Category.Education]: "#7ee8a2",
  [Category.Shopping]: "#ffd166",
  [Category.Travel]: "#06d6a0",
  [Category.Insurance]: "#c77dff",
  [Category.Subscriptions]: "#ff9a3c",
};

export const CATEGORY_COLOR_FALLBACK = Object.values(CATEGORY_COLORS);
