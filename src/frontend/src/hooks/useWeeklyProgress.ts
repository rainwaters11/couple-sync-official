import { useQuery } from "@tanstack/react-query";
import { getCompletionStore } from "../lib/completionStore";
import {
  getMondayForDate,
  getWeekDays,
  getWeekDaysForWeekStart,
} from "../lib/dates";
import { calculateWeekStreak } from "../lib/streak";

export interface WeeklyProgressData {
  weekProgress: Set<string>;
  weeklyCompletedCount: number;
  bestStreak: number;
  tagBreakdown: Record<string, number>;
}

export function useWeeklyProgress(weekKey?: string) {
  const { data } = useQuery({
    queryKey: ["weekly-progress", weekKey || "current"],
    staleTime: 0,
    queryFn: (): WeeklyProgressData => {
      const weekDays = weekKey
        ? getWeekDaysForWeekStart(weekKey)
        : getWeekDaysForWeekStart(
            getMondayForDate(new Date()).toISOString().split("T")[0],
          );
      const weekDateKeys = weekDays.map((d) => d.key);

      const store = getCompletionStore();
      const completedDays = new Set<string>();
      const tagBreakdown: Record<string, number> = {};

      // Get completions for this week
      for (const dateKey of weekDateKeys) {
        const completion = store.completions.find((c) => c.date === dateKey);
        if (completion) {
          completedDays.add(dateKey);

          // Count tags
          if (completion.tag) {
            tagBreakdown[completion.tag] =
              (tagBreakdown[completion.tag] || 0) + 1;
          }
        }
      }

      const weeklyCompletedCount = completedDays.size;
      const bestStreak = calculateWeekStreak(weekDateKeys, completedDays);

      return {
        weekProgress: completedDays,
        weeklyCompletedCount,
        bestStreak,
        tagBreakdown,
      };
    },
  });

  return {
    weekProgress: data?.weekProgress || new Set<string>(),
    weeklyCompletedCount: data?.weeklyCompletedCount || 0,
    bestStreak: data?.bestStreak || 0,
    tagBreakdown: data?.tagBreakdown || {},
  };
}
