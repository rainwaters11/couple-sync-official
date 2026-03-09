/**
 * Calculate the longest consecutive day streak from a set of completed date keys
 */
export function calculateStreak(completedDates: Set<string>): number {
  if (completedDates.size === 0) return 0;

  // Convert to sorted array of Date objects
  const dates = Array.from(completedDates)
    .map((key) => {
      const [year, month, day] = key.split("-").map(Number);
      return new Date(year, month - 1, day);
    })
    .sort((a, b) => a.getTime() - b.getTime());

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = dates[i - 1];
    const currDate = dates[i];

    // Calculate difference in days
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      // Break in streak
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Calculate the best streak within a specific week
 */
export function calculateWeekStreak(
  weekDateKeys: string[],
  completedDates: Set<string>,
): number {
  // Filter to only completed dates within this week
  const weekCompleted = weekDateKeys.filter((key) => completedDates.has(key));

  if (weekCompleted.length === 0) return 0;

  // Sort the week dates
  const sortedDates = weekCompleted.sort();

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);

    // Calculate difference in days
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      // Break in streak
      currentStreak = 1;
    }
  }

  return maxStreak;
}
