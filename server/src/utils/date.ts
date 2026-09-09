const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Daily entries are keyed by the user's local calendar date. The client is the only
 * party that knows the user's local timezone, so it sends that date as a plain
 * "YYYY-MM-DD" string. We store it as a UTC-midnight Date so the value is stable
 * and comparable regardless of server timezone, without drifting across DST.
 */
export function parseCalendarDate(dateStr: string): Date {
  if (!DATE_ONLY_PATTERN.test(dateStr)) {
    throw new Error(`Invalid calendar date: ${dateStr}. Expected YYYY-MM-DD.`);
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatCalendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayCalendarDateUTC(): string {
  return formatCalendarDate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}
