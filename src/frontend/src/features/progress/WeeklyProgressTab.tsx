import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useWeeklyProgress } from "../../hooks/useWeeklyProgress";
import { useWeeklySurprise } from "../../hooks/useWeeklySurprise";
import {
  addWeeks,
  formatDayOfWeek,
  formatWeekRange,
  getSaturdayWeekKey,
  getWeekDaysForWeekStart,
  isSameDay,
  isWeekInFuture,
} from "../../lib/dates";
import { getOptionById } from "../reward/weeklySurpriseOptions";
import MonthlyBadges from "./MonthlyBadges";
import StatTiles from "./StatTiles";
import WeekSummaryCard from "./WeekSummaryCard";
import WeeklyBadgeCard from "./WeeklyBadgeCard";

export default function WeeklyProgressTab() {
  const currentWeekKey = getSaturdayWeekKey();
  const [selectedWeekKey, setSelectedWeekKey] = useState(currentWeekKey);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { weekProgress, weeklyCompletedCount, bestStreak, tagBreakdown } =
    useWeeklyProgress(selectedWeekKey);
  const { weekScopedData } = useWeeklySurprise(selectedWeekKey);

  const weekDays = getWeekDaysForWeekStart(selectedWeekKey);
  const today = new Date();
  const weekRange = formatWeekRange(selectedWeekKey);
  const isCurrentWeek = selectedWeekKey === currentWeekKey;
  const canGoNext = !isWeekInFuture(addWeeks(selectedWeekKey, 1));
  const isUnlocked = weeklyCompletedCount >= 5;
  const progressPercent = Math.min((weeklyCompletedCount / 5) * 100, 100);

  const handlePrevWeek = () => {
    setSelectedWeekKey((prev) => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    if (canGoNext) {
      setSelectedWeekKey((prev) => addWeeks(prev, 1));
    }
  };

  const handleJumpToToday = () => {
    setSelectedWeekKey(currentWeekKey);
  };

  const handleResetData = () => {
    // Clear all app localStorage keys
    const keysToRemove = [
      "couple-sync-completions",
      "weeklySurprise",
      "weeklySurpriseCompletedDates",
      "devMode",
      "coupleSync-room",
      "coupleSync-partnerRole",
      "coupleSync-onboarded",
    ];
    for (const k of keysToRemove) localStorage.removeItem(k);
    // Clear any weekly-surprise-* keys
    const allKeys = Object.keys(localStorage);
    for (const k of allKeys.filter((k2) => k2.startsWith("weekly-surprise-"))) {
      localStorage.removeItem(k);
    }
    // Reload
    window.location.reload();
  };

  return (
    <div className="space-y-6 bg-rose-50 min-h-full p-1">
      {/* Week Navigation */}
      <div
        className="flex items-center justify-between gap-4"
        data-ocid="progress.section"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevWeek}
          className="h-10 w-10 rounded-full hover:bg-rose-100 text-rose-700"
          aria-label="Previous week"
          data-ocid="progress.pagination_prev"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg font-bold text-rose-900 tracking-tight">
            {weekRange}
          </h2>
          {!isCurrentWeek && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleJumpToToday}
              className="h-7 text-xs text-rose-600 hover:text-rose-900 hover:bg-rose-100 font-semibold"
              data-ocid="progress.button"
            >
              Jump to Today
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextWeek}
          disabled={!canGoNext}
          className="h-10 w-10 rounded-full hover:bg-rose-100 text-rose-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next week"
          data-ocid="progress.pagination_next"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Stat tiles */}
      <StatTiles completedCount={weeklyCompletedCount} />

      {/* Progress bar toward badge threshold */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-rose-200/50 shadow-soft space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-rose-700">
            {isUnlocked
              ? "Badge Unlocked"
              : `${weeklyCompletedCount} / 5 days to unlock badge`}
          </span>
          <span className="font-bold text-rose-900">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <Progress value={progressPercent} className="h-2.5 bg-rose-100" />
        {!isUnlocked && (
          <p className="text-xs text-rose-600">
            {5 - weeklyCompletedCount} more{" "}
            {5 - weeklyCompletedCount === 1 ? "day" : "days"} to earn the Weekly
            Bond Badge
          </p>
        )}
      </div>

      {/* Week Summary Card */}
      <WeekSummaryCard
        completedCount={weeklyCompletedCount}
        bestStreak={bestStreak}
        tagBreakdown={tagBreakdown}
        isUnlocked={isUnlocked}
      />

      {/* 7-day heart grid with transition */}
      <div
        key={selectedWeekKey}
        className={`week-content-transition ${prefersReducedMotion ? "reduce-motion" : ""}`}
      >
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-glow border-2 border-rose-200/50 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-rose-900 tracking-tight">
              {isCurrentWeek ? "This Week" : "Week Progress"}
            </h3>
            <span className="text-sm font-semibold text-rose-700">
              {weeklyCompletedCount} / 7
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {weekDays.map((day) => {
              const isCompleted = weekProgress.has(day.key);
              const isDayToday = isSameDay(day.date, today);
              const isPast = day.date < today && !isSameDay(day.date, today);
              const dateNum = day.date.getDate();
              const dayLetter = formatDayOfWeek(day.date).slice(0, 1);

              return (
                <div
                  key={day.key}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">
                    {dayLetter}
                  </span>
                  <div
                    className={`
                      w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border-2 transition-all
                      ${
                        isCompleted
                          ? "bg-rose-500 border-rose-500 shadow-md shadow-rose-500/30"
                          : isDayToday
                            ? "border-rose-300 bg-rose-50 ring-2 ring-rose-200/50"
                            : isPast
                              ? "border-gray-200 bg-gray-100"
                              : "border-gray-200 bg-gray-100"
                      }
                    `}
                  >
                    <Heart
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        isCompleted ? "fill-white text-white" : "text-gray-300"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-rose-700">
                    {dateNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Badge */}
        <div className="mt-5">
          <WeeklyBadgeCard completedCount={weeklyCompletedCount} />
        </div>

        {/* Weekly Surprise status — if data exists show a nice card */}
        {weekScopedData?.selectedId &&
          (() => {
            const surpriseOption = getOptionById(weekScopedData.selectedId);
            return (
              <div className="mt-5 bg-rose-50/80 backdrop-blur-sm rounded-2xl p-4 border border-rose-200/50">
                <p className="text-xs font-bold uppercase tracking-wide text-rose-600 mb-1">
                  Weekly Surprise
                </p>
                <p className="text-sm font-semibold text-rose-900">
                  {surpriseOption?.title ?? weekScopedData.selectedId}
                </p>
                <p className="text-xs text-rose-600 mt-0.5">
                  {weekScopedData.revealed
                    ? "Revealed"
                    : `Day ${weekScopedData.completedDays} of 7`}
                </p>
              </div>
            );
          })()}
      </div>

      {/* Monthly Badges */}
      <div className="mt-2">
        <MonthlyBadges />
      </div>

      {/* Reset Demo Data */}
      <div className="pt-4 pb-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-rose-500 hover:text-rose-700 hover:bg-rose-100 font-medium text-sm rounded-xl"
              data-ocid="progress.delete_button"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Reset Demo Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            className="rounded-2xl"
            data-ocid="progress.dialog"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all completion history, weekly surprises, room
                data, and settings. The app will reload. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="progress.cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-ocid="progress.confirm_button"
              >
                Reset Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
