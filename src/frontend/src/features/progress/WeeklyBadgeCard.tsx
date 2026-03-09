import { Lock } from "lucide-react";

interface WeeklyBadgeCardProps {
  completedCount: number;
}

export default function WeeklyBadgeCard({
  completedCount,
}: WeeklyBadgeCardProps) {
  const isUnlocked = completedCount >= 5;
  const progress = Math.min(completedCount, 5);

  if (isUnlocked) {
    return (
      <div
        className="p-8 rounded-2xl bg-white border-2 border-rose-200 relative overflow-hidden shadow-md"
        style={{ animation: "badge-glow-pulse 2.5s ease-in-out infinite" }}
      >
        {/* Subtle rose shimmer background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-rose-50 opacity-70" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          {/* Rosette SVG icon */}
          <div className="w-20 h-20 flex items-center justify-center">
            <svg
              viewBox="0 0 80 80"
              width="80"
              height="80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <title>Weekly Badge Rosette</title>
              <circle
                cx="40"
                cy="40"
                r="28"
                fill="#fce7f3"
                stroke="#f43f5e"
                strokeWidth="3"
              />
              <circle cx="40" cy="40" r="20" fill="#fb7185" opacity="0.3" />
              {/* Ribbon tails */}
              <path d="M30 58 L40 70 L50 58" fill="#f43f5e" opacity="0.8" />
              {/* Star burst */}
              <path
                d="M40 16 L42 28 L52 20 L46 31 L60 32 L49 38 L56 50 L44 44 L42 58 L38 44 L26 50 L33 38 L22 32 L36 31 L30 20 L40 28 Z"
                fill="#f43f5e"
                opacity="0.7"
              />
              <circle cx="40" cy="40" r="10" fill="white" />
              <path
                d="M36 40 l3 3 l6-6"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="font-bold text-2xl text-rose-600 tracking-tight">
              🎉 Weekly Badge Unlocked!
            </p>
            <p className="text-base text-rose-700 mt-1 leading-relaxed">
              Your relationship is thriving!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-2xl bg-white border-2 border-gray-200 relative overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-5 text-center">
        {/* Lock icon */}
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
          <Lock className="w-10 h-10 text-gray-400" strokeWidth={2} />
        </div>
        <div className="space-y-2">
          <p className="font-bold text-xl text-gray-700">Weekly Badge</p>
          <p className="text-base text-gray-500 leading-relaxed max-w-xs">
            Complete 5 out of 7 days to unlock
          </p>
        </div>
        {/* Progress dots in rose */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed 5-step progress dots
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i < progress ? "bg-rose-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500">{completedCount} / 5 days</p>
      </div>
    </div>
  );
}
