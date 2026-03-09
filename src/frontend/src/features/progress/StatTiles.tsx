import { CalendarDays, Heart } from "lucide-react";

interface StatTilesProps {
  completedCount: number;
}

export default function StatTiles({ completedCount }: StatTilesProps) {
  const remaining = Math.max(0, 7 - completedCount);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-rose-200/50 shadow-soft flex flex-col gap-2"
        data-ocid="progress.card"
      >
        <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
          <Heart className="w-5 h-5 text-rose-600" />
        </div>
        <p className="text-3xl font-bold text-rose-900 font-display leading-none">
          {completedCount}
          <span className="text-base font-normal text-rose-600 ml-1">/7</span>
        </p>
        <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide">
          Days Completed
        </p>
      </div>

      <div
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-rose-200/50 shadow-soft flex flex-col gap-2"
        data-ocid="progress.secondary_button"
      >
        <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-rose-600" />
        </div>
        <p className="text-3xl font-bold text-rose-900 font-display leading-none">
          {remaining}
          <span className="text-base font-normal text-rose-600 ml-1">/7</span>
        </p>
        <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide">
          Days Remaining
        </p>
      </div>
    </div>
  );
}
