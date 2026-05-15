export const SortDir = {
  asc: "asc",
  desc: "desc",
} as const;

export type SortDir = (typeof SortDir)[keyof typeof SortDir];
