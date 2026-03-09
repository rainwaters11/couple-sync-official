import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClueForDay,
  getOptionById,
} from "../features/reward/weeklySurpriseOptions";
import { getSaturdayWeekKey } from "../lib/dates";
import {
  type WeeklySurpriseWeekData,
  dismissWeekReveal,
  getWeeklySurpriseByWeek,
  initializeWeeklySurprise,
  setWeeklySurpriseByWeek,
} from "../lib/weeklySurpriseStore";
import { getStoredPartnerRole } from "./useRoom";
import { useRoomSync } from "./useRoomSync";

export interface WeeklySurpriseData {
  // selectedOption is now derived from the week-scoped record (weekData.selectedId)
  // so it is always tied to the active week, not the real-today key.
  selectedOption: string | null;
  revealDismissed: boolean;
  hasSelection: boolean;
  weekKey: string;
  weekData: WeeklySurpriseWeekData | null;
  weekScopedData: WeeklySurpriseWeekData | null; // Backward compatibility alias
  unlockedDay: number;
  currentClue: string | null;
  revealMessage: string | null;
  // The surprise ID that will be revealed on Day 7
  // (partner's in room mode, own in solo mode)
  revealSourceId: string | null;
  isRoomMode: boolean;
}

/**
 * Optional: pass partnerSurpriseId when calling from the Sync tab in room mode.
 * When provided, the clue is derived from the PARTNER's surprise selection
 * (cross-hint logic). In solo mode this should be undefined/null.
 */
export function useWeeklySurprise(
  weekKey?: string,
  partnerSurpriseId?: string | null,
) {
  const queryClient = useQueryClient();
  const currentWeekKey = getSaturdayWeekKey();
  const targetWeekKey = weekKey || currentWeekKey;
  const { pushRoomUpdate, pushRoleSurpriseUpdate } = useRoomSync();

  const { data, isLoading } = useQuery<WeeklySurpriseData>({
    queryKey: ["weekly-surprise", targetWeekKey, partnerSurpriseId ?? "solo"],
    queryFn: () => {
      // ALL reads are strictly keyed to targetWeekKey so that when the user
      // time-travels to a new Saturday in Dev Mode the hook sees an empty week
      // and hasSelection returns false — triggering the Surprise Picker immediately.
      const weekData = getWeeklySurpriseByWeek(targetWeekKey);

      // hasSelection: a selection exists for THIS specific week only.
      // Reads from the week-scoped record (weekData.selectedId), NOT a global flag.
      const selectedOption = weekData?.selectedId ?? null;
      const hasSelection = selectedOption !== null && selectedOption !== "";

      // revealDismissed: also week-scoped — a new week always starts as false
      // so the reveal ceremony can fire again on that week's Day 7.
      const revealDismissed = weekData?.revealDismissed === true;

      // Calculate unlocked day (1-6 for clues, treated as 7 on reveal days)
      // Uses modulo so the cycle repeats every 7 days indefinitely.
      // completedDays=7 → dayOfCycle=0 (reveal), completedDays=8 → dayOfCycle=1 (clue 1 of week 2), etc.
      const completedDays = weekData?.completedDays ?? 0;
      const dayOfCycle = completedDays % 7; // 0 = currently at a reveal milestone
      // For clue lookup: reveal days use day index 7 (last clue slot), clue days use 1-6
      const unlockedDay =
        completedDays === 0 ? 0 : dayOfCycle === 0 ? 7 : dayOfCycle;

      // Cross-hint treasure-hunt logic:
      //
      //   You select a surprise = the surprise YOU are PLANNING FOR your partner.
      //   Your partner selects a surprise = the surprise THEY are PLANNING FOR you.
      //
      //   CLUES: each day you complete a sync, you receive a clue hinting at what
      //          YOUR PARTNER chose for you (partnerSurpriseId in room mode).
      //          In solo mode, clues hint at your own selection (self-care reminder).
      //
      //   REVEAL: on Day 7 you see what your partner planned for you.
      //           In solo mode you see your own selection.
      //
      //   COMPLETION: completedDays is ALWAYS local — never synced from partner.
      //               Your own completions advance YOUR clue counter.
      const isRoomMode = !!localStorage.getItem("coupleSync-room");
      const partnerRole = isRoomMode ? getStoredPartnerRole() : null;

      // Clue source: partner's surprise in room mode, own selection in solo mode
      const clueSourceId =
        isRoomMode && partnerSurpriseId ? partnerSurpriseId : selectedOption;

      let currentClue: string | null = null;
      if (clueSourceId && unlockedDay > 0) {
        currentClue = getClueForDay(clueSourceId, unlockedDay, partnerRole);
      }

      // Reveal source: same as clue source — show what partner planned for you
      let revealMessage: string | null = null;
      const revealSourceId =
        isRoomMode && partnerSurpriseId ? partnerSurpriseId : selectedOption;
      if (revealSourceId) {
        const option = getOptionById(revealSourceId);
        if (option) {
          revealMessage = option.revealCopy || option.description;
        }
      }

      return {
        selectedOption,
        revealDismissed,
        hasSelection,
        weekKey: targetWeekKey,
        weekData,
        weekScopedData: weekData, // Backward compatibility alias
        unlockedDay,
        currentClue,
        revealMessage,
        revealSourceId,
        isRoomMode,
      };
    },
  });

  const selectMutation = useMutation({
    mutationFn: async (option: string) => {
      // 1. Initialize week-scoped data immediately, keyed to the ACTIVE week
      //    (targetWeekKey). In Dev Mode this is the simulated Saturday week,
      //    NOT the real-today key. This is the core fix: the picker must write
      //    to the same key that hasSelection reads from.
      const existingData = getWeeklySurpriseByWeek(targetWeekKey);
      if (existingData) {
        // Preserve completedDays/hintIndex if week data already exists
        setWeeklySurpriseByWeek(targetWeekKey, {
          ...existingData,
          selectedId: option,
          revealDismissed: false, // reset for the new selection
        });
      } else {
        initializeWeeklySurprise(targetWeekKey, option);
      }

      // 2. Fire ICP backend calls in the background — never block the UI.
      //    Failures are silently caught; localStorage is already up-to-date.
      (async () => {
        try {
          // Legacy: keeps existing completedDates sync in the room working
          await pushRoomUpdate("", option);
          // New: write to the role-specific slot for cross-hint system
          await pushRoleSurpriseUpdate(option);
        } catch {
          // Silently ignored — localStorage state is already updated above.
        }
      })();

      // mutationFn returns here immediately; the modal can close right away.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["weekly-surprise", targetWeekKey],
      });
    },
  });

  const dismissRevealMutation = useMutation({
    mutationFn: async () => {
      // Week-scoped dismiss: marks revealDismissed=true ONLY for targetWeekKey.
      // The next week starts fresh (revealDismissed is undefined/false) so the
      // reveal ceremony fires again on that week's Day 7.
      dismissWeekReveal(targetWeekKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["weekly-surprise", targetWeekKey],
      });
    },
  });

  // Backward compatibility: getHint function (returns description + sparkle)
  const getHint = (optionId: string | null): string | null => {
    if (!optionId) return null;
    const option = getOptionById(optionId);
    if (!option) return null;
    return `${option.description} ✨`;
  };

  const getLabel = (optionId: string | null): string | null => {
    if (!optionId) return null;
    const option = getOptionById(optionId);
    return option?.title || null;
  };

  const getOption = (optionId: string | null) => {
    if (!optionId) return null;
    return getOptionById(optionId);
  };

  return {
    selectedOption: data?.selectedOption || null,
    revealDismissed: data?.revealDismissed || false,
    hasSelection: data?.hasSelection || false,
    weekKey: data?.weekKey || targetWeekKey,
    weekData: data?.weekData || null,
    weekScopedData: data?.weekScopedData || null, // Backward compatibility
    unlockedDay: data?.unlockedDay || 0,
    currentClue: data?.currentClue || null,
    revealMessage: data?.revealMessage || null,
    revealSourceId: data?.revealSourceId || null,
    isRoomMode: data?.isRoomMode || false,
    isLoading,
    selectOption: selectMutation.mutate,
    dismissReveal: dismissRevealMutation.mutate,
    getHint, // Backward compatibility
    getLabel,
    getOption,
  };
}
