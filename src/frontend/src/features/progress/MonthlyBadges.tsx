import { Lock } from "lucide-react";
import { getCompletionStore } from "../../lib/completionStore";

const UNLOCK_THRESHOLD = 20;

function getMonthlyCompletions(prefix: string): number {
  const store = getCompletionStore();
  return store.completions.filter((c) => c.date.startsWith(prefix)).length;
}

interface BadgeCardProps {
  label: string;
  imageSrc: string;
  count: number;
  isUnlocked: boolean;
  ocid: string;
}

function BadgeCard({
  label,
  imageSrc,
  count,
  isUnlocked,
  ocid,
}: BadgeCardProps) {
  return (
    <div
      className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
        isUnlocked
          ? "border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50/30 shadow-md"
          : "border-gray-200/50 bg-white/60"
      }`}
      data-ocid={ocid}
    >
      {/* Badge image area */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center">
        <img
          src={imageSrc}
          alt={`${label} badge`}
          className={`w-full h-full object-cover ${isUnlocked ? "" : "grayscale opacity-60"}`}
        />
        {/* Locked overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
        )}
        {/* Unlocked overlay at bottom */}
        {isUnlocked && (
          <div className="absolute bottom-0 left-0 right-0 bg-rose-500/80 text-white text-[10px] font-bold text-center py-1 rounded-b-full">
            🎉 Unlocked!
          </div>
        )}
      </div>

      {/* Badge label */}
      <p className="text-xs font-bold text-rose-900 text-center leading-tight">
        {label}
      </p>

      {/* Status */}
      {isUnlocked ? (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-rose-700">✨ Earned</span>
          <button
            type="button"
            className="mt-1 text-[10px] text-rose-500 font-semibold border border-rose-200 rounded-full px-2 py-0.5 hover:bg-rose-50 transition-colors"
            disabled
          >
            ✨ Mint as NFT
            <span className="text-rose-400 ml-0.5">(Soon)</span>
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs text-rose-600">
            {count}/{UNLOCK_THRESHOLD}
          </p>
          <p className="text-xs text-rose-500 leading-tight">
            Unlock at {UNLOCK_THRESHOLD} days
          </p>
        </div>
      )}
    </div>
  );
}

export default function MonthlyBadges() {
  const janCount = getMonthlyCompletions("2026-01");
  const febCount = getMonthlyCompletions("2026-02");
  const marCount = getMonthlyCompletions("2026-03");

  return (
    <div className="space-y-4" data-ocid="monthly.section">
      {/* Preload badge images — inline literal paths so build scanner always includes them */}
      <img
        src="/assets/uploads/january_-2-1.png"
        alt=""
        aria-hidden
        className="hidden"
      />
      <img
        src="/assets/uploads/cupid_covenant-2-2.png"
        alt=""
        aria-hidden
        className="hidden"
      />
      <img
        src="/assets/uploads/March_luck-2-3.png"
        alt=""
        aria-hidden
        className="hidden"
      />

      <h3 className="text-lg font-bold text-rose-900 tracking-tight">
        Monthly Badges
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <BadgeCard
          label="Jan 2026"
          imageSrc="/assets/uploads/january_-2-1.png"
          count={janCount}
          isUnlocked={janCount >= UNLOCK_THRESHOLD}
          ocid="monthly.item.1"
        />
        <BadgeCard
          label="Feb 2026"
          imageSrc="/assets/uploads/cupid_covenant-2-2.png"
          count={febCount}
          isUnlocked={febCount >= UNLOCK_THRESHOLD}
          ocid="monthly.item.2"
        />
        <BadgeCard
          label="Mar 2026"
          imageSrc="/assets/uploads/March_luck-2-3.png"
          count={marCount}
          isUnlocked={marCount >= UNLOCK_THRESHOLD}
          ocid="monthly.item.3"
        />
      </div>
    </div>
  );
}
