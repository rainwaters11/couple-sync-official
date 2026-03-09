import { Heart } from "lucide-react";
import { useWeeklyProgress } from "../../hooks/useWeeklyProgress";
import {
  getMondayWeekKey,
  getWeekDaysForWeekStart,
  isSameDay,
} from "../../lib/dates";

interface WeekViewStripProps {
  selectedDate: Date;
  onSelectDay: (date: Date) => void;
  devMode?: boolean;
}

export default function WeekViewStrip({
  selectedDate,
  onSelectDay,
  devMode = false,
}: WeekViewStripProps) {
  const weekKey = getMondayWeekKey();
  const weekDays = getWeekDaysForWeekStart(weekKey);
  const today = new Date();
  const { weekProgress } = useWeeklyProgress(weekKey);

  const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="mt-4 px-2">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 border border-warm-200/50 shadow-soft">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, index) => {
            const isCompleted = weekProgress.has(day.key);
            const isToday = isSameDay(day.date, today);
            const isSelected = isSameDay(day.date, selectedDate);
            const isFuture =
              !devMode && day.date > today && !isSameDay(day.date, today);
            const dateNum = day.date.getDate();

            return (
              <button
                type="button"
                key={day.key}
                onClick={() => onSelectDay(day.date)}
                disabled={isFuture}
                className={`
                  flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all
                  ${isSelected ? "bg-warm-100 ring-2 ring-warm-400" : "hover:bg-warm-50"}
                  ${isToday && !isSelected ? "ring-1 ring-warm-300" : ""}
                  ${isFuture ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <span className="text-xs font-bold text-warm-700 uppercase tracking-wide">
                  {DAY_LETTERS[index]}
                </span>
                <div
                  className={`
                  w-8 h-8 rounded-xl flex items-center justify-center border transition-all
                  ${
                    isCompleted
                      ? "bg-warm-500 border-warm-500"
                      : isToday
                        ? "bg-warm-100 border-warm-400"
                        : "bg-white/60 border-warm-200"
                  }
                `}
                >
                  <Heart
                    className={`w-4 h-4 ${isCompleted ? "fill-white text-white" : "text-warm-300"}`}
                  />
                </div>
                <span
                  className={`text-xs font-semibold ${isToday ? "text-warm-700" : "text-warm-600"}`}
                >
                  {dateNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
