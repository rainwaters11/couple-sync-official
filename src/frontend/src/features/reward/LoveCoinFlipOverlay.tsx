import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

interface LoveCoinFlipOverlayProps {
  open: boolean;
  surpriseTitle: string;
  onComplete: () => void;
}

export default function LoveCoinFlipOverlay({
  open,
  surpriseTitle,
  onComplete,
}: LoveCoinFlipOverlayProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"flip" | "choosing" | "reveal" | "done">(
    "flip",
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setPhase("flip");
      setVisible(false);
      return;
    }

    setVisible(true);

    if (prefersReducedMotion) {
      setPhase("reveal");
      return;
    }

    const timers = [
      setTimeout(() => setPhase("choosing"), 1600),
      setTimeout(() => setPhase("reveal"), 2200),
      // Auto-advance after 3.5s total
      setTimeout(() => {
        onComplete();
      }, 3800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [open, prefersReducedMotion, onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.62 0.18 20), oklch(0.70 0.16 22), oklch(0.88 0.08 35))",
        opacity: visible ? 1 : 0,
        transition: "opacity 400ms ease-out",
      }}
      data-ocid="coin.modal"
    >
      {/* Sparkle dots background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 15% 25%, rgba(255,255,255,0.3) 0%, transparent 2%),
            radial-gradient(circle at 85% 20%, rgba(255,255,255,0.25) 0%, transparent 2%),
            radial-gradient(circle at 50% 70%, rgba(255,255,255,0.2) 0%, transparent 2%),
            radial-gradient(circle at 75% 80%, rgba(255,255,255,0.3) 0%, transparent 2%),
            radial-gradient(circle at 30% 60%, rgba(255,255,255,0.25) 0%, transparent 2%)
          `,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-sm">
        {/* Coin */}
        <div className="coin-scene">
          <div
            className={`coin-inner ${phase === "flip" && !prefersReducedMotion ? "coin-inner" : ""}`}
            style={
              prefersReducedMotion
                ? { transform: "rotateY(720deg)", transition: "none" }
                : phase === "flip"
                  ? {}
                  : { animation: "none", transform: "rotateY(0deg)" }
            }
          >
            {/* Front: heart */}
            <div className="coin-face coin-front">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
              >
                <title>Heart</title>
                <path
                  d="M32 54C32 54 8 40 8 22C8 14.268 14.268 8 22 8C26.418 8 30.418 10.09 32 13.27C33.582 10.09 37.582 8 42 8C49.732 8 56 14.268 56 22C56 40 32 54 32 54Z"
                  fill="white"
                  fillOpacity="0.9"
                />
              </svg>
            </div>
            {/* Back: infinity */}
            <div className="coin-face coin-back">
              <svg
                width="64"
                height="32"
                viewBox="0 0 64 32"
                fill="none"
                aria-hidden="true"
              >
                <title>Infinity</title>
                <path
                  d="M32 16C32 16 25 4 16 4C7 4 2 9.5 2 16C2 22.5 7 28 16 28C25 28 32 16 32 16Z"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M32 16C32 16 39 4 48 4C57 4 62 9.5 62 16C62 22.5 57 28 48 28C39 28 32 16 32 16Z"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Text below coin */}
        {(phase === "flip" || phase === "choosing") && (
          <p className="text-white font-semibold text-lg">
            Choosing your surprise…
          </p>
        )}

        {(phase === "reveal" || phase === "done") && (
          <div className="reward-reveal text-center space-y-4">
            <p className="text-white/80 text-sm uppercase tracking-widest font-medium">
              Your Weekly Surprise
            </p>
            <h3 className="font-display text-3xl font-bold text-white">
              {surpriseTitle}
            </h3>
            <p className="text-white/90 text-base font-medium">
              Consistency is the real romance. This is your reward.
            </p>
            <Button
              onClick={onComplete}
              className="mt-4 bg-white text-warm-700 hover:bg-warm-50 font-bold px-8 py-3 rounded-2xl shadow-lg transition-all hover:shadow-xl"
              data-ocid="coin.confirm_button"
            >
              See Your Surprise
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
