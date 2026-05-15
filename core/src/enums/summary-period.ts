export const SummaryPeriod = {
  today: "today",
  week: "week",
  month: "month",
  year: "year",
  custom: "custom",
} as const;

export type SummaryPeriod = (typeof SummaryPeriod)[keyof typeof SummaryPeriod];
