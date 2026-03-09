/**
 * Date utility functions for the application
 */

/**
 * Get today's date key in YYYY-MM-DD format
 */
export function getTodayKey(date: Date = new Date()): string {
  // Use local date components to avoid UTC-offset date-shift bugs.
  // e.g. at 10 PM CST (UTC-6), toISOString() would return the NEXT day in UTC.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format day of week as short abbreviation (e.g., "Mon", "Tue")
 */
export function formatDayOfWeek(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Format a date range for display (e.g., "Jan 1 - Jan 7")
 * Can accept either a Date or a string week key
 */
export function formatWeekRange(startDateOrKey: Date | string): string {
  const startDate =
    typeof startDateOrKey === "string"
      ? parseWeekKey(startDateOrKey)
      : startDateOrKey;

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return getTodayKey(date1) === getTodayKey(date2);
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get the Monday of the week for a given date
 */
export function getMondayForDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the Monday week key (YYYY-MM-DD) for the current week
 */
export function getMondayWeekKey(date: Date = new Date()): string {
  const monday = getMondayForDate(date);
  return getTodayKey(monday);
}

/**
 * Get the Saturday that starts the current Weekly Surprise cycle.
 *
 * Weekly Surprise weeks run Saturday → Friday.
 * This means couples can choose a new surprise every Saturday when the
 * week resets, and the Day 7 reveal falls on the following Friday.
 *
 * Logic:
 *   getDay() returns 0 (Sun) … 6 (Sat).
 *   We want the most recent Saturday on or before `date`.
 *   Saturday = 6, so daysBack = (day - 6 + 7) % 7 gives:
 *     Sat → 0 (today), Sun → 1, Mon → 2, … Fri → 6
 */
export function getSaturdayForDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const daysBack = (day - 6 + 7) % 7; // how far back to the most recent Sat
  d.setDate(d.getDate() - daysBack);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the Saturday-anchored week key (YYYY-MM-DD) for the current
 * Weekly Surprise week.  Use this everywhere the surprise week boundary
 * needs to reset on Saturday.
 */
export function getSaturdayWeekKey(date: Date = new Date()): string {
  return getTodayKey(getSaturdayForDate(date));
}

/**
 * Parse a week key (YYYY-MM-DD) into a Date object
 */
export function parseWeekKey(weekKey: string): Date {
  return new Date(`${weekKey}T00:00:00`);
}

/**
 * Add weeks to a week key or date (returns the Monday of the target week as a string key)
 */
export function addWeeks(mondayOrKey: Date | string, weeks: number): string {
  const monday =
    typeof mondayOrKey === "string" ? parseWeekKey(mondayOrKey) : mondayOrKey;

  const result = new Date(monday);
  result.setDate(result.getDate() + weeks * 7);
  return getTodayKey(result);
}

/**
 * Check if a week (represented by its week-start key) is in the future.
 * Works with both Monday-anchored and Saturday-anchored week keys.
 */
export function isWeekInFuture(weekStartKey: string): boolean {
  const weekStart = parseWeekKey(weekStartKey);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // The week is in the future only when its start date is strictly after today
  return weekStart > today;
}

/**
 * Generate an array of dates for a week starting from Monday
 */
export function getWeekDays(monday: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(day);
  }
  return days;
}

/**
 * Generate an array of day objects for a week given a week key
 */
export function getWeekDaysForWeekStart(
  weekKey: string,
): Array<{ date: Date; key: string }> {
  const monday = parseWeekKey(weekKey);
  const days: Array<{ date: Date; key: string }> = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push({
      date: day,
      key: getTodayKey(day),
    });
  }

  return days;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
}
