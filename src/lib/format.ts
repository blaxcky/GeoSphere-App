export const numberFormat = new Intl.NumberFormat("de-AT", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export const dateTimeFormat = new Intl.DateTimeFormat("de-AT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const timeFormat = new Intl.DateTimeFormat("de-AT", {
  hour: "2-digit",
  minute: "2-digit",
});

const relativeTimeFormat = new Intl.RelativeTimeFormat("de-AT", { numeric: "auto" });

export function formatTemperature(value: number | null | undefined) {
  return typeof value === "number" ? numberFormat.format(value) : "Keine Daten";
}

export function formatAltitude(value: number | null) {
  return typeof value === "number" ? `${Math.round(value)} m` : "n/a";
}

export function formatRelativeTime(timestamp: string, now = Date.now()) {
  const diffMinutes = Math.round((new Date(timestamp).getTime() - now) / 60_000);
  if (Math.abs(diffMinutes) < 60) return relativeTimeFormat.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return relativeTimeFormat.format(diffHours, "hour");
  return relativeTimeFormat.format(Math.round(diffHours / 24), "day");
}

export function formatSignedDelta(value: number) {
  const formatted = numberFormat.format(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
}
