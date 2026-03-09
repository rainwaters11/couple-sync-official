import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Heart, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { usePartnerSurprise } from "../../hooks/usePartnerSurprise";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useTodayCompletion } from "../../hooks/useTodayCompletion";
import { useWeeklySurprise } from "../../hooks/useWeeklySurprise";
import {
  addDays,
  formatDate,
  getSaturdayWeekKey,
  getTodayKey,
  isSameDay,
  parseWeekKey,
} from "../../lib/dates";
import {
  getDailyRitual,
  getRitualCategory,
  isThursday,
} from "../../lib/rituals";
import BloomCelebration from "./BloomCelebration";
import ConfettiBurst from "./ConfettiBurst";
import CoupleSyncEmblem from "./CoupleSyncEmblem";
import WeekViewStrip from "./WeekViewStrip";

interface SyncOfTheDayTabProps {
  devMode?: boolean;
  onRevealTrigger?: () => void;
  isOnboarded?: boolean;
  onDismissOnboarding?: () => void;
  /** Lifted state: controlled selected date from App.tsx so it knows the active week */
  selectedDate?: Date;
  onSelectedDateChange?: (date: Date) => void;
}

export default function SyncOfTheDayTab({
  devMode = false,
  onRevealTrigger,
  isOnboarded = true,
  onDismissOnboarding,
  selectedDate: controlledSelectedDate,
  onSelectedDateChange,
}: SyncOfTheDayTabProps) {
  const today = new Date();
  // Support both controlled (lifted) and uncontrolled date state.
  // When App.tsx passes selectedDate/onSelectedDateChange, we use those so the
  // App-level useWeeklySurprise call always sees the correct active week key.
  const [internalSelectedDate, setInternalSelectedDate] = useState(today);
  const selectedDate = controlledSelectedDate ?? internalSelectedDate;
  const setSelectedDate = (date: Date) => {
    setInternalSelectedDate(date);
    onSelectedDateChange?.(date);
  };
  const [fadeKey, setFadeKey] = useState(0);
  const [showBloom, setShowBloom] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWeekView, setShowWeekView] = useState(false);

  const selectedDateKey = getTodayKey(selectedDate);

  // Derive the active week key from selectedDate (not real-world today).
  // This ensures completedDays, shouldShowHint, and isRevealDay all read from
  // the currently navigated week — critical for Developer Mode fast-forwarding.
  const activeWeekKey = getSaturdayWeekKey(parseWeekKey(selectedDateKey));

  const { isCompleted, markComplete, isLoading } =
    useTodayCompletion(selectedDateKey);

  // Fetch partner's surprise ID from backend (on mount only, no polling timer)
  const {
    partnerSurpriseId,
    isFetchingPartner,
    isInRoom,
    refetchPartnerSurprise,
  } = usePartnerSurprise();

  // Pass activeWeekKey (derived from selectedDate) so that completedDays,
  // shouldShowHint, and isRevealDay all read from the currently navigated week
  // rather than defaulting to the real-world date's week.
  const { weekData, selectedOption, currentClue } = useWeeklySurprise(
    activeWeekKey,
    partnerSurpriseId,
  );

  const prefersReducedMotion = usePrefersReducedMotion();
  const selectedRitual = getDailyRitual(selectedDateKey);
  const selectedCategory = getRitualCategory(selectedDateKey);
  const isWildSync = isThursday(selectedDateKey);

  const isToday = isSameDay(selectedDate, today);
  const isFutureDate = selectedDate > today;
  const canNavigateRight = devMode || !isFutureDate;

  const roomMode = isInRoom;

  // In room mode, show the clue from the partner's surprise (cross-hint).
  // currentClue is already correctly resolved by useWeeklySurprise.
  const clueToShow = currentClue;

  // True when in room mode but the partner hasn't selected their surprise yet
  const waitingForPartner =
    isInRoom && !isFetchingPartner && !partnerSurpriseId && !!selectedOption;

  // Show hint whenever the day is completed, a surprise is selected, and we are
  // NOT on a reveal-milestone day (multiples of 7 trigger the reveal ceremony instead).
  // The hint card loops indefinitely across weeks via modulo — completedDays is never reset.
  const isRevealDay =
    weekData != null &&
    weekData.completedDays > 0 &&
    weekData.completedDays % 7 === 0;
  const shouldShowHint =
    selectedOption &&
    isCompleted &&
    weekData &&
    !isRevealDay &&
    weekData.completedDays > 0;

  const handleComplete = async () => {
    if (!isCompleted && (isToday || devMode)) {
      const result = await markComplete(selectedCategory);
      if (!prefersReducedMotion) {
        setShowBloom(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      // After completing, re-fetch partner's surprise in case they just selected one
      refetchPartnerSurprise();
      if (result?.justRevealed && onRevealTrigger) {
        setTimeout(() => onRevealTrigger!(), 2000);
      }
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate(addDays(selectedDate, -1));
    setFadeKey((prev) => prev + 1);
  };

  const handleNextDay = () => {
    if (canNavigateRight) {
      setSelectedDate(addDays(selectedDate, 1));
      setFadeKey((prev) => prev + 1);
    }
  };

  const handleWeekDaySelect = (date: Date) => {
    setSelectedDate(date);
    setFadeKey((prev) => prev + 1);
  };

  // Formatted date display
  const displayDate = isToday
    ? new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : formatDate(selectedDate);

  const fadeClass = prefersReducedMotion ? "" : "ritual-day-fade";

  return (
    <div className="space-y-4 pb-8">
      {showConfetti && <ConfettiBurst />}
      <BloomCelebration active={showBloom} />

      {/* Onboarding hint card */}
      {!isOnboarded && (
        <div
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-warm-200 shadow-soft flex items-start gap-3"
          data-ocid="onboarding.card"
        >
          <div className="w-7 h-7 rounded-full bg-warm-100 flex items-center justify-center shrink-0 mt-0.5">
            <Heart className="w-3.5 h-3.5 text-warm-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-warm-900 mb-0.5">
              Welcome to Couple Sync
            </p>
            <p className="text-xs text-warm-700 leading-relaxed">
              Complete today's sync and start your streak. Optionally, sync with
              your partner using a room code.
            </p>
          </div>
          <button
            type="button"
            onClick={onDismissOnboarding}
            className="shrink-0 text-xs font-bold text-warm-600 hover:text-warm-800 transition-colors px-2 py-1 rounded-lg hover:bg-warm-100"
            data-ocid="onboarding.close_button"
          >
            Got it
          </button>
        </div>
      )}

      {/* Tab Header + Emblem inline to save space */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="space-y-0.5">
          <h2 className="font-display text-2xl font-bold text-warm-900 tracking-tight">
            Sync of the Day
          </h2>
          <p className="text-warm-700 font-medium text-sm">Your Love Sync</p>
          <p
            className={`text-xs text-warm-600 font-medium ${prefersReducedMotion ? "" : "date-animated"}`}
          >
            {displayDate}
          </p>
        </div>
        <CoupleSyncEmblem compact />
      </div>

      {/* Day navigation */}
      <div
        className="flex items-center justify-between px-2"
        data-ocid="sync.section"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousDay}
          className="h-10 w-10 rounded-full hover:bg-warm-100 text-warm-700"
          data-ocid="sync.pagination_prev"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="text-center">
          {!isToday && (
            <button
              type="button"
              onClick={() => {
                setSelectedDate(today);
                setFadeKey((prev) => prev + 1);
              }}
              className="text-xs text-warm-600 hover:text-warm-800 underline underline-offset-2 font-medium"
              data-ocid="sync.link"
            >
              Back to today
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextDay}
          disabled={!canNavigateRight}
          className="h-10 w-10 rounded-full hover:bg-warm-100 text-warm-700 disabled:opacity-30 disabled:cursor-not-allowed"
          data-ocid="sync.pagination_next"
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Ritual card with fade */}
      <div key={fadeKey} className={fadeClass}>
        {/* Sync Type pill */}
        <div className="flex justify-center mb-3">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-bold text-sm uppercase tracking-wide ${
              isWildSync
                ? "bg-rose-100 text-rose-900 border border-rose-300 shadow-sm"
                : "bg-warm-100 border-warm-200 text-warm-700"
            }`}
          >
            {isWildSync ? (
              <>
                <Star className="w-3.5 h-3.5 fill-rose-700 text-rose-700" />
                <span className="text-rose-900">Wild Sync</span>
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5" />
                {selectedCategory}
              </>
            )}
          </div>
        </div>

        {/* Main card */}
        <div
          className={`bg-white/80 backdrop-blur-md rounded-3xl shadow-glow border-2 transition-all duration-500 ${
            isCompleted && isToday
              ? "border-warm-400 shadow-warm-glow bg-gradient-to-br from-white/90 to-warm-50/80"
              : "border-warm-200/50"
          }`}
        >
          <div className="p-6 space-y-5">
            {/* Ritual prompt */}
            <p className="font-display text-xl text-warm-900 font-bold leading-snug">
              {selectedRitual}
            </p>

            {/* Mark Complete button — always rendered first, always visible */}
            {isCompleted ? (
              <button
                type="button"
                disabled
                className="w-full bg-green-50 text-green-700 font-bold py-3 rounded-xl flex items-center justify-center border border-green-200 cursor-default"
                data-ocid="sync.primary_button"
              >
                <Heart className="w-5 h-5 mr-2 fill-green-400 text-green-400" />
                Completed!
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isLoading || (!isToday && !devMode)}
                className="w-full bg-[#E57373] hover:bg-[#EF5350] text-white font-semibold py-3 rounded-xl shadow-sm transition-colors active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:cursor-default"
                data-ocid="sync.primary_button"
              >
                {isLoading
                  ? "Saving…"
                  : !isToday && !devMode
                    ? isFutureDate
                      ? "Future Sync"
                      : "Past Sync"
                    : "Mark Complete"}
              </button>
            )}

            {/* Completed supportive message */}
            {isCompleted && (
              <p className="text-center text-sm text-warm-700 font-medium leading-relaxed">
                {isToday
                  ? "You showed up today. That's what love looks like."
                  : "This day was completed."}
              </p>
            )}

            {/* Weekly Surprise Hint — shown below completion message, never hides button */}
            {shouldShowHint && (
              <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
                {/* 7-petal progress row — cycles per week via modulo */}
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const rawDays = weekData?.completedDays || 0;
                    const daysInCycle =
                      rawDays % 7 === 0 && rawDays > 0 ? 7 : rawDays % 7;
                    return (
                      <svg
                        // biome-ignore lint/suspicious/noArrayIndexKey: ordered petal progress indicators
                        key={i}
                        width="16"
                        height="16"
                        viewBox="0 0 18 18"
                        fill="none"
                        aria-hidden="true"
                        className={`transition-all ${
                          i < daysInCycle
                            ? "opacity-100 scale-105"
                            : "opacity-25 scale-90"
                        }`}
                      >
                        <circle cx="9" cy="9" r="3.5" fill="#e11d48" />
                        {[0, 60, 120, 180, 240, 300].map((angle, pi) => {
                          const rad = (angle * Math.PI) / 180;
                          return (
                            <ellipse
                              // biome-ignore lint/suspicious/noArrayIndexKey: fixed 6-petal positions
                              key={pi}
                              cx={9 + 5 * Math.cos(rad)}
                              cy={9 + 5 * Math.sin(rad)}
                              rx="2.5"
                              ry="1.5"
                              transform={`rotate(${angle} ${9 + 5 * Math.cos(rad)} ${9 + 5 * Math.sin(rad)})`}
                              fill={i < daysInCycle ? "#fda4af" : "#fecdd3"}
                            />
                          );
                        })}
                      </svg>
                    );
                  })}
                </div>

                {/* Hint text */}
                {roomMode && waitingForPartner ? (
                  <p className="text-rose-700 font-medium italic text-sm">
                    Waiting for your partner to choose your surprise...
                  </p>
                ) : clueToShow ? (
                  <>
                    <p className="text-rose-600 text-xs font-semibold uppercase tracking-wide mb-1">
                      {roomMode
                        ? "Clue about your surprise"
                        : "Your weekly clue"}
                    </p>
                    <p className="text-rose-700 font-medium italic text-sm mb-2">
                      "{clueToShow}"
                    </p>
                    {roomMode && (
                      <p className="text-xs text-rose-400 mt-1">
                        ♡ Your partner chose this experience for you. Keep
                        completing to unlock the full reveal.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-rose-700 font-medium italic text-sm">
                    {roomMode
                      ? "Waiting for your partner to choose your surprise..."
                      : "Complete today's sync to unlock your clue."}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Week View toggle */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowWeekView((v) => !v)}
          className="text-sm font-medium text-warm-600 hover:text-warm-800 transition-colors px-4 py-2 rounded-xl hover:bg-warm-50"
          data-ocid="sync.toggle"
        >
          {showWeekView ? "Hide Week" : "Show Week"}
        </button>
      </div>

      {showWeekView && (
        <WeekViewStrip
          selectedDate={selectedDate}
          onSelectDay={handleWeekDaySelect}
          devMode={devMode}
        />
      )}
    </div>
  );
}
