import { Card, CardContent } from "@/components/ui/card";
import { Award, Flame, Heart, Tag } from "lucide-react";

interface WeekSummaryCardProps {
  completedCount: number;
  bestStreak: number;
  tagBreakdown: Record<string, number>;
  isUnlocked: boolean;
}

export default function WeekSummaryCard({
  completedCount,
  bestStreak,
  tagBreakdown,
  isUnlocked,
}: WeekSummaryCardProps) {
  const hasTagData = Object.keys(tagBreakdown).length > 0;

  return (
    <Card className="bg-gradient-to-br from-rose-50 to-rose-100/50 backdrop-blur-md rounded-2xl border-2 border-rose-200/50 shadow-soft">
      <CardContent className="pt-6">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-rose-900 tracking-tight">
              Your Week
            </h3>
            <Heart className="w-5 h-5 text-rose-500" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Days Completed */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-rose-200/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-rose-600" />
                </div>
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide">
                  Days
                </span>
              </div>
              <p className="text-2xl font-bold text-rose-900">
                {completedCount}
                <span className="text-base text-rose-600 font-normal">/7</span>
              </p>
            </div>

            {/* Weekly Badge Status */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-rose-200/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Award className="w-4 h-4 text-rose-600" />
                </div>
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide">
                  Badge
                </span>
              </div>
              <p className="text-sm font-bold text-rose-900">
                {isUnlocked ? (
                  <span className="text-rose-600">Unlocked ✨</span>
                ) : (
                  <span className="text-rose-500">Unlock at 5/7</span>
                )}
              </p>
            </div>

            {/* Best Streak */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-rose-200/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-rose-600" />
                </div>
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide">
                  Best Streak
                </span>
              </div>
              <p className="text-2xl font-bold text-rose-900">
                {bestStreak} {bestStreak === 1 ? "day" : "days"}
              </p>
            </div>

            {/* Love Language Focus */}
            {hasTagData ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-rose-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide">
                    Focus
                  </span>
                </div>
                <div className="space-y-1">
                  {Object.entries(tagBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([tag, count]) => (
                      <div
                        key={tag}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-rose-800 font-medium truncate">
                          {tag}
                        </span>
                        <span className="text-rose-600 font-bold ml-2">
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-rose-200/50 flex items-center justify-center">
                <p className="text-xs text-rose-600 text-center">
                  Tag rituals to see your focus
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
