import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTodayCompletion } from "../../hooks/useTodayCompletion";
import { useWeeklyProgress } from "../../hooks/useWeeklyProgress";
import { useWeeklySurprise } from "../../hooks/useWeeklySurprise";
import { formatDate, getTodayKey } from "../../lib/dates";
import { getRitualCategory } from "../../lib/rituals";
import ConfettiBurst from "../ritual/ConfettiBurst";

export default function SyncOfTheDayTab() {
  const { isCompleted, markComplete, isLoading } = useTodayCompletion();
  const { weeklyCompletedCount } = useWeeklyProgress();
  const { getHint, selectedOption } = useWeeklySurprise();
  const [showConfetti, setShowConfetti] = useState(false);

  const todayKey = getTodayKey();
  const todayCategory = getRitualCategory(todayKey);
  const progressPercent = (weeklyCompletedCount / 7) * 100;

  const hint = selectedOption ? getHint(selectedOption) : null;
  const shouldShowHint = isCompleted && hint;

  const handleComplete = () => {
    if (!isCompleted) {
      markComplete(todayCategory);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {showConfetti && <ConfettiBurst />}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-warm-500 via-coral to-peach p-8 shadow-warm-glow">
        <div className="relative z-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white uppercase tracking-wide">
              Love Language of the Day
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {todayCategory}
          </h1>
          <p className="text-white/90 text-base font-medium">
            {formatDate(new Date())}
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* Couple Card */}
      <Card
        className={`bg-white/70 backdrop-blur-md rounded-3xl shadow-glow border-2 transition-all duration-500 ${
          isCompleted
            ? "border-warm-400 shadow-warm-glow"
            : "border-warm-200/50"
        }`}
      >
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-warm-900 font-bold tracking-tight">
            Today's Sync
          </CardTitle>
          <CardDescription className="text-warm-700 text-base font-medium">
            Complete your daily ritual together
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Couple Illustration */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-[8/5] rounded-2xl overflow-hidden shadow-soft">
              <img
                src="/assets/generated/couple-card.dim_800x500.png"
                alt="Couple together"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-warm-700">
                Weekly Progress
              </span>
              <span className="font-bold text-warm-900">
                {weeklyCompletedCount} / 7
              </span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-warm-100" />
          </div>

          {/* Complete Button */}
          <Button
            onClick={handleComplete}
            disabled={isCompleted || isLoading}
            className={`w-full h-14 text-lg font-bold rounded-2xl transition-all ${
              isCompleted
                ? "bg-warm-500 hover:bg-warm-500 text-white cursor-default"
                : "bg-warm-600 hover:bg-warm-700 text-white shadow-md hover:shadow-lg"
            }`}
          >
            {isCompleted ? (
              <span className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-white" />
                Completed Today
              </span>
            ) : (
              "Mark as Complete"
            )}
          </Button>

          {/* Weekly Surprise Hint */}
          {shouldShowHint && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-warm-50 to-peach/20 border-2 border-warm-200/50">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-warm-600" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-bold text-sm text-warm-900 mb-1">
                    Weekly Surprise Hint
                  </h3>
                  <p className="text-sm text-warm-800 leading-relaxed">
                    {hint}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
