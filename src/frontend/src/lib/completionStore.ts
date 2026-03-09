/**
 * Versioned localStorage structure for completion history
 * Format: { version: 1, completions: CompletionEntry[] }
 */

export interface CompletionEntry {
  date: string; // YYYY-MM-DD
  timestamp: number;
  tag?: string; // Optional Love Language tag
  note?: string; // Optional note (for future use)
}

export interface CompletionStore {
  version: number;
  completions: CompletionEntry[];
}

const STORAGE_KEY = "couple-sync-completions";
const CURRENT_VERSION = 1;

/**
 * Get the completion store from localStorage
 */
export function getCompletionStore(): CompletionStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { version: CURRENT_VERSION, completions: [] };
    }

    const parsed = JSON.parse(stored);

    // Validate structure
    if (typeof parsed !== "object" || parsed === null) {
      return { version: CURRENT_VERSION, completions: [] };
    }

    // Handle version migration if needed in the future
    if (parsed.version !== CURRENT_VERSION) {
      // For now, just use current version
      return {
        version: CURRENT_VERSION,
        completions: Array.isArray(parsed.completions)
          ? parsed.completions
          : [],
      };
    }

    return {
      version: parsed.version || CURRENT_VERSION,
      completions: Array.isArray(parsed.completions) ? parsed.completions : [],
    };
  } catch {
    return { version: CURRENT_VERSION, completions: [] };
  }
}

/**
 * Save the completion store to localStorage
 */
export function saveCompletionStore(store: CompletionStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error("Failed to save completion store:", error);
  }
}

/**
 * Add a completion entry
 */
export function addCompletion(
  dateKey: string,
  tag?: string,
  note?: string,
): void {
  const store = getCompletionStore();

  // Check if already completed for this date
  const existingIndex = store.completions.findIndex((c) => c.date === dateKey);

  const entry: CompletionEntry = {
    date: dateKey,
    timestamp: Date.now(),
    ...(tag && { tag }),
    ...(note && { note }),
  };

  if (existingIndex >= 0) {
    // Update existing entry
    store.completions[existingIndex] = entry;
  } else {
    // Add new entry
    store.completions.push(entry);
  }

  saveCompletionStore(store);
}

/**
 * Get completion for a specific date
 */
export function getCompletion(dateKey: string): CompletionEntry | null {
  const store = getCompletionStore();
  return store.completions.find((c) => c.date === dateKey) || null;
}

/**
 * Check if a date is completed
 */
export function isDateCompleted(dateKey: string): boolean {
  return getCompletion(dateKey) !== null;
}

/**
 * Get all completions for a date range
 */
export function getCompletionsInRange(
  startDate: string,
  endDate: string,
): CompletionEntry[] {
  const store = getCompletionStore();
  return store.completions.filter(
    (c) => c.date >= startDate && c.date <= endDate,
  );
}

/**
 * Get completions as a Set of date keys (for backward compatibility)
 */
export function getCompletedDatesSet(): Set<string> {
  const store = getCompletionStore();
  return new Set(store.completions.map((c) => c.date));
}

/**
 * Migrate old localStorage data to new format (one-time migration)
 */
export function migrateOldData(): void {
  const store = getCompletionStore();

  // If we already have data, don't migrate
  if (store.completions.length > 0) {
    return;
  }

  // Try to migrate from old completedDates array
  try {
    const oldData = localStorage.getItem("completedDates");
    if (oldData) {
      const parsed = JSON.parse(oldData);
      if (Array.isArray(parsed)) {
        const newCompletions: CompletionEntry[] = [];

        for (const item of parsed) {
          let dateKey: string | null = null;

          if (typeof item === "string") {
            // Try to normalize to YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(item)) {
              dateKey = item;
            } else {
              const date = new Date(item);
              if (!Number.isNaN(date.getTime())) {
                dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
              }
            }
          } else if (typeof item === "number") {
            const date = new Date(item);
            if (!Number.isNaN(date.getTime())) {
              dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            }
          }

          if (dateKey) {
            newCompletions.push({
              date: dateKey,
              timestamp: Date.now(),
            });
          }
        }

        if (newCompletions.length > 0) {
          store.completions = newCompletions;
          saveCompletionStore(store);
        }
      }
    }
  } catch (error) {
    console.error("Failed to migrate old data:", error);
  }

  // Also try to migrate from old per-day localStorage keys
  try {
    const prefix = "ritual-progress-default-";
    const keys = Object.keys(localStorage);
    const oldKeys = keys.filter((k) => k.startsWith(prefix));

    for (const key of oldKeys) {
      if (localStorage.getItem(key) === "true") {
        const dateKey = key.replace(prefix, "");
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
          const existing = store.completions.find((c) => c.date === dateKey);
          if (!existing) {
            store.completions.push({
              date: dateKey,
              timestamp: Date.now(),
            });
          }
        }
      }
    }

    if (store.completions.length > 0) {
      saveCompletionStore(store);
    }
  } catch (error) {
    console.error("Failed to migrate per-day data:", error);
  }
}
