import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useTodayCompletion } from "../../hooks/useTodayCompletion";
import { useWeeklySurprise } from "../../hooks/useWeeklySurprise";
import { addDays, formatDate, getTodayKey, isSameDay } from "../../lib/dates";
import { getDailyRitual, getRitualCategory } from "../../lib/rituals";
import ConfettiBurst from "./ConfettiBurst";

interface TodayRitualTabProps {
  devMode?: boolean;
  onRevealTrigger?: () => void;
}

export default function TodayRitualTab({
  devMode = false,
  onRevealTrigger,
}: TodayRitualTabProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [fadeKey, setFadeKey] = useState(0);

  const { isCompleted, markComplete, isLoading } = useTodayCompletion();
  const { currentClue, weekData, selectedOption } = useWeeklySurprise();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [showConfetti, setShowConfetti] = useState(false);

  const selectedDateKey = getTodayKey(selectedDate);
  const selectedRitual = getDailyRitual(selectedDateKey);
  const selectedCategory = getRitualCategory(selectedDateKey);

  const isToday = isSameDay(selectedDate, today);
  const isFutureDate = selectedDate > today;
  const canNavigateRight = devMode || !isFutureDate;

  // Show hint only if: has selection, is today, completed, not revealed yet, and has unlocked clues
  const shouldShowHint =
    selectedOption &&
    isToday &&
    isCompleted &&
    weekData &&
    !weekData.revealed &&
    weekData.completedDays > 0 &&
    weekData.completedDays < 7 &&
    currentClue;

  const handleComplete = async () => {
    if (!isCompleted && isToday) {
      const result = await markComplete(selectedCategory);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // If this completion just triggered the reveal, notify parent
      if (result?.justRevealed && onRevealTrigger) {
        onRevealTrigger();
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

  // Apply fade animation class
  const fadeClass = prefersReducedMotion ? "" : "ritual-day-fade";

  return (
    <div className="space-y-8">
      {showConfetti && <ConfettiBurst />}

      {/* Date Navigation */}
      <div className="flex items-center justify-between gap-4 px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousDay}
          className="h-10 w-10 rounded-full hover:bg-warm-100"
        >
          <ChevronLeft className="h-5 w-5 text-warm-700" />
        </Button>

        <div className="text-center">
          <p className="text-lg font-bold text-warm-900">
            {isToday ? "Today's Ritual" : formatDate(selectedDate)}
          </p>
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="text-sm text-warm-600 hover:text-warm-700 underline underline-offset-2"
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
          className="h-10 w-10 rounded-full hover:bg-warm-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5 text-warm-700" />
        </Button>
      </div>

      {/* Ritual Card with fade animation */}
      <div key={fadeKey} className={fadeClass}>
        <Card
          className={`bg-white/70 backdrop-blur-md rounded-3xl shadow-glow border-2 transition-all duration-500 ${
            isCompleted && isToday
              ? "border-warm-400 shadow-warm-glow bg-gradient-to-br from-white/80 to-warm-50/80"
              : "border-warm-200/50"
          }`}
        >
          <CardHeader className="pb-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warm-100 border border-warm-200 w-fit">
              <Heart className="w-4 h-4 text-warm-600" />
              <span className="text-sm font-bold text-warm-700 uppercase tracking-wide">
                {selectedCategory}
              </span>
            </div>
            <CardTitle className="text-3xl text-warm-900 font-bold tracking-tight leading-tight">
              {isToday ? "Today's Ritual" : "Daily Ritual"}
            </CardTitle>
            <CardDescription className="text-warm-700 text-lg font-medium leading-relaxed">
              {selectedRitual}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleComplete}
              disabled={!isToday || isCompleted || isLoading}
              className={`w-full h-14 text-lg font-bold rounded-2xl transition-all ${
                isCompleted && isToday
                  ? "bg-warm-500 hover:bg-warm-500 text-white cursor-default"
                  : "bg-warm-600 hover:bg-warm-700 text-white shadow-md hover:shadow-lg disabled:opacity-50"
              }`}
            >
              {isCompleted && isToday ? (
                <span className="flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-white" />
                  Completed
                </span>
              ) : !isToday ? (
                isFutureDate ? (
                  "Future Ritual"
                ) : (
                  "Past Ritual"
                )
              ) : (
                "Mark as Complete"
              )}
            </Button>

            {/* Weekly Surprise Hint */}
            {shouldShowHint && (
              <div className="p-5 rounded-xl bg-gradient-to-br from-warm-50 to-peach/20 border-2 border-warm-200/50">
                <div className="flex items-start gap-3 mb-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-warm-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-bold text-sm text-warm-900 mb-1">
                      Weekly Surprise Clue
                    </h3>
                  </div>
                </div>

                {/* 7-icon progress row */}
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed 7-day progress indicators
                      key={i}
                      className={`text-lg transition-all ${
                        i < (weekData?.completedDays || 0)
                          ? "opacity-100 scale-100"
                          : "opacity-30 scale-90"
                      }`}
                    >
                      🌸
                    </div>
                  ))}
                </div>

                {/* Current clue */}
                <p className="text-sm text-warm-800 leading-relaxed italic mb-3 text-center">
                  "{currentClue}"
                </p>

                {/* Partner compare helper line */}
                <p className="text-xs text-warm-600 text-center leading-relaxed">
                  Compare clues with your partner — it won't make sense until
                  you put them together.{" "}
                  <Heart className="inline w-3 h-3 fill-warm-500 text-warm-500" />
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
