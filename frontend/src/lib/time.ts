const TIMEZONE = import.meta.env.VITE_TIMEZONE ?? "Europe/Bucharest";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
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
