interface CoupleSyncEmblemProps {
  compact?: boolean;
}

export default function CoupleSyncEmblem({
  compact = false,
}: CoupleSyncEmblemProps) {
  const size = compact ? "w-14 h-14" : "w-24 h-24";
  const svgW = compact ? 36 : 56;
  const svgH = compact ? 20 : 32;
  return (
    <div
      className={`flex items-center justify-center ${compact ? "" : "my-4"}`}
    >
      <div className={`relative ${size} flex items-center justify-center`}>
        {/* Outer soft ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-warm-100 via-peach to-amber opacity-50" />
        {/* Inner glow ring */}
        <div className="absolute inset-2 rounded-full bg-white/70 backdrop-blur-sm border border-warm-200/60 shadow-soft" />
        {/* Infinity SVG */}
        <div className="relative z-10 emblem-glow">
          <svg
            width={svgW}
            height={svgH}
            viewBox="0 0 56 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Infinity symbol"
            role="img"
          >
            <title>Infinity symbol emblem</title>
            <defs>
              <linearGradient id="inf-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.14 25)" />
                <stop offset="50%" stopColor="oklch(0.62 0.18 20)" />
                <stop offset="100%" stopColor="oklch(0.70 0.16 22)" />
              </linearGradient>
            </defs>
            {/* Infinity path */}
            <path
              d="M28 16C28 16 22 6 14 6C6 6 2 10.5 2 16C2 21.5 6 26 14 26C22 26 28 16 28 16Z"
              stroke="url(#inf-grad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M28 16C28 16 34 6 42 6C50 6 54 10.5 54 16C54 21.5 50 26 42 26C34 26 28 16 28 16Z"
              stroke="url(#inf-grad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Center dot */}
            <circle cx="28" cy="16" r="2.5" fill="oklch(0.62 0.18 20)" />
          </svg>
        </div>
        {/* Rotating outer ring decoration */}
        <svg
          className="absolute inset-0 w-full h-full emblem-ring opacity-30"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Small dots around the circle */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360;
            const rad = (angle * Math.PI) / 180;
            const r = 44;
            const cx = 48 + r * Math.cos(rad);
            const cy = 48 + r * Math.sin(rad);
            return (
              <circle
                // biome-ignore lint/suspicious/noArrayIndexKey: decorative ordered ring dots
                key={i}
                cx={cx}
                cy={cy}
                r={i % 3 === 0 ? 2.5 : 1.5}
                fill="oklch(0.62 0.18 20)"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
