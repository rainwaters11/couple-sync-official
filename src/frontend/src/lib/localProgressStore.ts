const STORAGE_PREFIX = "ritual-progress";

export function getLocalCompletion(room: string, dateKey: string): boolean {
  const key = `${STORAGE_PREFIX}-${room}-${dateKey}`;
  return localStorage.getItem(key) === "true";
}

export function setLocalCompletion(
  room: string,
  dateKey: string,
  completed: boolean,
): void {
  const key = `${STORAGE_PREFIX}-${room}-${dateKey}`;
  if (completed) {
    localStorage.setItem(key, "true");
  } else {
    localStorage.removeItem(key);
  }
}

/**
 * Get completed dates from the completedDates array in localStorage
 * Returns a Set of ISO date strings (YYYY-MM-DD)
 */
export function getCompletedDatesFromStorage(): Set<string> {
  try {
    const stored = localStorage.getItem("completedDates");
    if (!stored) return new Set();

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return new Set();

    const normalized = new Set<string>();

    for (const item of parsed) {
      // Handle string dates
      if (typeof item === "string") {
        // Try to parse as ISO date or timestamp
        const dateStr = normalizeToDateKey(item);
        if (dateStr) normalized.add(dateStr);
      }
      // Handle timestamp numbers
      else if (typeof item === "number") {
        const date = new Date(item);
        if (!Number.isNaN(date.getTime())) {
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          normalized.add(key);
        }
      }
      // Handle objects with date/timestamp fields
      else if (typeof item === "object" && item !== null) {
        const dateValue = item.date || item.timestamp || item.dateKey;
        if (dateValue) {
          const dateStr = normalizeToDateKey(dateValue);
          if (dateStr) normalized.add(dateStr);
        }
      }
    }

    return normalized;
  } catch {
    return new Set();
  }
}

/**
 * Normalize various date formats to YYYY-MM-DD
 */
function normalizeToDateKey(value: any): string | null {
  try {
    // Already in YYYY-MM-DD format
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    // Try to parse as date
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  } catch {
    return null;
  }
}
