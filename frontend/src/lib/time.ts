const TIMEZONE = import.meta.env.VITE_TIMEZONE ?? "Europe/Bucharest";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const tzAbbreviationFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  timeZoneName: "short",
});

const tzAbbreviation = tzAbbreviationFormatter
  .formatToParts(new Date())
  .find((p) => p.type === "timeZoneName")?.value;

export function formatTime(date: Date): string {
  return `${timeFormatter.format(date)} ${tzAbbreviation}`;
}

export function formatDateTime(date: Date): string {
  return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
}
