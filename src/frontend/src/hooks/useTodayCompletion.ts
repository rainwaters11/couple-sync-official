import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  addCompletion,
  getCompletion,
  isDateCompleted,
  migrateOldData,
} from "../lib/completionStore";
import { getSaturdayWeekKey, getTodayKey, parseWeekKey } from "../lib/dates";
import {
  getWeeklySurpriseByWeek,
  incrementWeeklySurpriseProgress,
} from "../lib/weeklySurpriseStore";
import { useRoomSync } from "./useRoomSync";

export function useTodayCompletion(targetDateKey?: string) {
  const queryClient = useQueryClient();
  const todayKey = getTodayKey();
  const dateKey = targetDateKey ?? todayKey;
  const { pushRoomUpdate } = useRoomSync();

  // Run migration once on mount
  useEffect(() => {
    migrateOldData();
  }, []);

  const { data: isCompleted = false, isLoading } = useQuery({
    queryKey: ["completion", dateKey],
    queryFn: () => {
      return isDateCompleted(dateKey);
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ tag, note }: { tag?: string; note?: string } = {}) => {
      const wasAlreadyCompleted = getCompletion(dateKey) !== null;

      addCompletion(dateKey, tag, note);

      // Only increment weekly surprise progress if this is a first-time completion
      let justRevealed = false;
      if (!wasAlreadyCompleted) {
        // Derive week key from the actual date being completed (supports devMode future dates).
        // IMPORTANT: use parseWeekKey (which appends T00:00:00 for LOCAL time) instead of
        // new Date(dateKey) which parses YYYY-MM-DD as UTC midnight — causing a date-shift
        // bug in negative-UTC-offset timezones (e.g. CST = UTC-6) where the date resolves
        // to the previous calendar day, producing a different Saturday anchor than the picker.
        const currentWeekKey = getSaturdayWeekKey(parseWeekKey(dateKey));
        console.log(
          "Saving Completion to Week:",
          currentWeekKey,
          "| dateKey:",
          dateKey,
        );
        const incremented = incrementWeeklySurpriseProgress(
          currentWeekKey,
          dateKey,
        );

        // Check if this completion just triggered a reveal milestone (any multiple of 7)
        if (incremented) {
          const weekData = getWeeklySurpriseByWeek(currentWeekKey);
          // Reveal fires on Day 7, 14, 21, ... (completedDays % 7 === 0)
          justRevealed =
            weekData != null &&
            weekData.completedDays > 0 &&
            weekData.completedDays % 7 === 0;
        }

        // Push to ICP backend (fire-and-forget; failure is handled silently)
        const weekData = getWeeklySurpriseByWeek(currentWeekKey);
        const surpriseId = weekData?.selectedId ?? "";
        pushRoomUpdate(dateKey, surpriseId);
      }

      return { justRevealed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["completion", dateKey] });
      queryClient.invalidateQueries({ queryKey: ["weekly-progress"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-surprise"] });
    },
  });

  return {
    isCompleted,
    isLoading: isLoading || mutation.isPending,
    markComplete: (tag?: string, note?: string) =>
      mutation.mutateAsync({ tag, note }),
  };
}
