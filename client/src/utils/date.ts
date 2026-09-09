/** The user's local calendar date as YYYY-MM-DD — used to key daily check-ins so the
 * "today" boundary follows the browser's timezone, not the server's. */
export function todayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function hoursMinutesToDecimal(hours: number, minutes: number): number {
  return Math.round((hours + minutes / 60) * 100) / 100;
}

export function decimalToHoursMinutes(decimal: number): { hours: number; minutes: number } {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return { hours, minutes };
}
