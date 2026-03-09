import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

interface Confetto {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

export default function ConfettiBurst() {
  const [confetti, setConfetti] = useState<Confetto[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const colors = [
      "oklch(0.72 0.14 25)", // warm-400
      "oklch(0.70 0.16 22)", // coral
      "oklch(0.88 0.08 35)", // peach
      "oklch(0.85 0.12 50)", // amber
      "oklch(0.62 0.18 20)", // warm-500
    ];

    const pieceCount = prefersReducedMotion ? 15 : 25;
    const baseDuration = prefersReducedMotion ? 1 : 2.5;

    const pieces: Confetto[] = Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: baseDuration + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setConfetti(pieces);
  }, [prefersReducedMotion]);

  return (
    <div className="confetti-container">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetto"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
