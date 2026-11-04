/**
 * Date utilities for Ledger
 * All dates are managed in IST (Asia/Kolkata, UTC+5:30) as required.
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns today's date in IST formatted as YYYY-MM-DD
 */
export function getTodayIST(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return parts; // en-CA gives YYYY-MM-DD
}

/**
 * Returns the first day of the current month in IST formatted as YYYY-MM-01
 */
export function getCurrentMonthFirstDayIST(): string {
  const today = getTodayIST();
  return `${today.substring(0, 7)}-01`;
}

/**
 * Normalizes any date string (YYYY-MM-DD) to its month start date (YYYY-MM-01)
 */
export function toMonthStart(dateStr: string): string {
  return `${dateStr.substring(0, 7)}-01`;
}

/**
 * Returns the next month start date (YYYY-MM-01)
 */
export function getNextMonthStart(monthStartStr: string): string {
  const [yearStr, monthStr] = monthStartStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }

  const mm = month < 10 ? `0${month}` : `${month}`;
  return `${year}-${mm}-01`;
}

/**
 * Returns the previous month start date (YYYY-MM-01)
 */
export function getPrevMonthStart(monthStartStr: string): string {
  const [yearStr, monthStr] = monthStartStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  month -= 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }

  const mm = month < 10 ? `0${month}` : `${month}`;
  return `${year}-${mm}-01`;
}

/**
 * Checks if a given month start date (YYYY-MM-01) is the current month in IST
 */
export function isCurrentMonth(monthStartStr: string): boolean {
  return monthStartStr.substring(0, 7) === getTodayIST().substring(0, 7);
}

/**
 * Checks if a date string (YYYY-MM-DD) is in the future in IST
 */
export function isFutureDateIST(dateStr: string): boolean {
  const today = getTodayIST();
  return dateStr > today;
}

/**
 * Formats a month (YYYY-MM-01) into full name, e.g. "October 2024"
 */
export function formatMonthYear(monthStartStr: string): string {
  const [year, month] = monthStartStr.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Formats a month (YYYY-MM-01) into short name, e.g. "Oct 2024"
 */
export function formatShortMonthYear(monthStartStr: string): string {
  const [year, month] = monthStartStr.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Formats a month (YYYY-MM-01) into badge tag, e.g. "OCT 24"
 */
export function formatMonthBadge(monthStartStr: string): string {
  const [year, month] = monthStartStr.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  const monthShort = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const yearShort = year.slice(-2);
  return `${monthShort} ${yearShort}`;
}

/**
 * Formats an entry date (YYYY-MM-DD) into display string, e.g. "14 Oct 2024"
 */
export function formatEntryDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  const dayStr = String(parseInt(day, 10)).padStart(2, '0');
  const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
  return `${dayStr} ${monthStr} ${year}`;
}

/**
 * Formats today's date timestamp as required: "As of today, 14 Oct 2024"
 */
export function getAsOfTodayString(): string {
  const today = getTodayIST();
  return `As of today, ${formatEntryDate(today)}`;
}
