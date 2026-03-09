import { getSaturdayWeekKey } from "./dates";

const STORAGE_PREFIX = "weekly-surprise";
const WEEK_SCOPED_KEY = "weeklySurprise";
const COMPLETION_TRACKING_KEY = "weeklySurpriseCompletedDates";

export interface WeeklySurpriseState {
  selectedOption: string | null;
  revealDismissed: boolean;
}

export interface WeeklySurpriseWeekData {
  selectedId: string;
  hintIndex: number;
  revealed: boolean;
  completedDays: number;
  revealDismissed?: boolean; // week-scoped: true once the user dismisses the reveal for this specific week
}

export interface WeeklySurpriseRecord {
  [weekKey: string]: WeeklySurpriseWeekData;
}

export interface WeeklyCompletionTracking {
  [weekKey: string]: string[]; // Array of dateKeys that have been counted for this week
}

function getStorageKey(weekKey: string): string {
  return `${STORAGE_PREFIX}-${weekKey}`;
}

export function getWeeklySurpriseState(weekKey: string): WeeklySurpriseState {
  const key = getStorageKey(weekKey);
  const stored = localStorage.getItem(key);

  if (!stored) {
    return {
      selectedOption: null,
      revealDismissed: false,
    };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return {
      selectedOption: null,
      revealDismissed: false,
    };
  }
}

export function setWeeklySurpriseState(
  weekKey: string,
  state: WeeklySurpriseState,
): void {
  const key = getStorageKey(weekKey);
  localStorage.setItem(key, JSON.stringify(state));
}

export function getCurrentWeeklySurpriseState(): WeeklySurpriseState {
  const currentWeekKey = getSaturdayWeekKey();
  return getWeeklySurpriseState(currentWeekKey);
}

export function setCurrentWeeklySurpriseState(
  state: WeeklySurpriseState,
): void {
  const currentWeekKey = getSaturdayWeekKey();
  setWeeklySurpriseState(currentWeekKey, state);
}

/**
 * Get the full weekly surprise record (all weeks)
 */
export function getWeeklySurpriseRecord(): WeeklySurpriseRecord {
  try {
    const stored = localStorage.getItem(WEEK_SCOPED_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null) return {};

    return parsed;
  } catch {
    return {};
  }
}

/**
 * Save the full weekly surprise record
 */
export function saveWeeklySurpriseRecord(record: WeeklySurpriseRecord): void {
  try {
    localStorage.setItem(WEEK_SCOPED_KEY, JSON.stringify(record));
  } catch {
    // Fail silently
  }
}

/**
 * Get week-scoped surprise data for a specific week
 */
export function getWeeklySurpriseByWeek(
  weekKey: string,
): WeeklySurpriseWeekData | null {
  const record = getWeeklySurpriseRecord();
  return record[weekKey] || null;
}

/**
 * Set week-scoped surprise data for a specific week
 */
export function setWeeklySurpriseByWeek(
  weekKey: string,
  data: WeeklySurpriseWeekData,
): void {
  const record = getWeeklySurpriseRecord();
  record[weekKey] = data;
  saveWeeklySurpriseRecord(record);
}

/**
 * Get completion tracking for weekly surprise progression
 */
export function getWeeklyCompletionTracking(): WeeklyCompletionTracking {
  try {
    const stored = localStorage.getItem(COMPLETION_TRACKING_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null) return {};

    return parsed;
  } catch {
    return {};
  }
}

/**
 * Save completion tracking
 */
export function saveWeeklyCompletionTracking(
  tracking: WeeklyCompletionTracking,
): void {
  try {
    localStorage.setItem(COMPLETION_TRACKING_KEY, JSON.stringify(tracking));
  } catch {
    // Fail silently
  }
}

/**
 * Check if a date has already been counted for weekly surprise progression
 */
export function hasDateBeenCounted(weekKey: string, dateKey: string): boolean {
  const tracking = getWeeklyCompletionTracking();
  const weekDates = tracking[weekKey] || [];
  return weekDates.includes(dateKey);
}

/**
 * Mark a date as counted for weekly surprise progression
 */
export function markDateAsCounted(weekKey: string, dateKey: string): void {
  const tracking = getWeeklyCompletionTracking();
  if (!tracking[weekKey]) {
    tracking[weekKey] = [];
  }
  if (!tracking[weekKey].includes(dateKey)) {
    tracking[weekKey].push(dateKey);
    saveWeeklyCompletionTracking(tracking);
  }
}

/**
 * Mark the reveal as dismissed for a specific week.
 * This is week-scoped so a new week always starts with revealed=false
 * and the reveal ceremony can fire again on that week's Day 7.
 */
export function dismissWeekReveal(weekKey: string): void {
  const data = getWeeklySurpriseByWeek(weekKey);
  if (data) {
    setWeeklySurpriseByWeek(weekKey, { ...data, revealDismissed: true });
  } else {
    // Edge case: no week data yet — create a minimal record so the flag persists
    const record = getWeeklySurpriseRecord();
    record[weekKey] = {
      selectedId: "",
      hintIndex: 0,
      revealed: false,
      completedDays: 0,
      revealDismissed: true,
    };
    saveWeeklySurpriseRecord(record);
  }
}

/**
 * Initialize a new weekly surprise selection
 */
export function initializeWeeklySurprise(
  weekKey: string,
  selectedId: string,
): void {
  const data: WeeklySurpriseWeekData = {
    selectedId,
    hintIndex: 0,
    revealed: false,
    completedDays: 0,
  };
  setWeeklySurpriseByWeek(weekKey, data);
}

/**
 * Increment weekly surprise progression (called on daily completion)
 */
export function incrementWeeklySurpriseProgress(
  weekKey: string,
  dateKey: string,
): boolean {
  // Check if already counted
  if (hasDateBeenCounted(weekKey, dateKey)) {
    return false;
  }

  let data = getWeeklySurpriseByWeek(weekKey);
  if (!data) {
    // No surprise selected yet for this week (e.g. user is completing days in the first
    // week before picking a surprise, or the picker was skipped). Create a minimal
    // placeholder so completedDays still increments and the reveal can still fire.
    // The selectedId will be filled in when / if the user picks a surprise.
    data = {
      selectedId: "",
      hintIndex: 0,
      revealed: false,
      completedDays: 0,
    };
    setWeeklySurpriseByWeek(weekKey, data);
  }

  // Increment completedDays — never resets, grows indefinitely for badge tracking
  const newCompletedDays = data.completedDays + 1;

  // hintIndex cycles 0-5 per week using modulo (6 clues per 7-day loop)
  // Day positions within the current week cycle: 1-6 show clues, 7 triggers reveal
  const dayOfWeekCycle = newCompletedDays % 7; // 0 = reveal day (multiple of 7)
  const newHintIndex =
    dayOfWeekCycle === 0 ? 6 : Math.min(dayOfWeekCycle - 1, 5);

  // Reveal triggers on ANY multiple of 7 (Day 7, 14, 21, ...)
  // "revealed" here means "currently at a reveal milestone" — not a permanent lock
  const newRevealed = newCompletedDays > 0 && newCompletedDays % 7 === 0;

  const updatedData: WeeklySurpriseWeekData = {
    ...data,
    completedDays: newCompletedDays,
    hintIndex: newHintIndex,
    revealed: newRevealed,
  };

  setWeeklySurpriseByWeek(weekKey, updatedData);
  markDateAsCounted(weekKey, dateKey);

  return true;
}
