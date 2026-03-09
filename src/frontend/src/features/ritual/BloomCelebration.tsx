import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

interface BloomCelebrationProps {
  active: boolean;
}

export default function BloomCelebration({ active }: BloomCelebrationProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 2800);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!visible || prefersReducedMotion) return null;

  // 6 petals arranged in a circle
  const petalAngles = [0, 60, 120, 180, 240, 300];
  // 12 floating petals at random positions
  const floatingPetals = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: 20 + Math.random() * 60,
    top: 30 + Math.random() * 40,
    delay: Math.random() * 0.6,
    rot: (Math.random() - 0.5) * 360,
    floatRot: (Math.random() - 0.5) * 720,
  }));

  return (
    <div className="bloom-container" aria-hidden="true">
      {/* Main bloom center */}
      <div className="relative" style={{ width: 200, height: 200 }}>
        {/* Petals */}
        {petalAngles.map((angle, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed 6-petal ordered array
            key={i}
            className="bloom-petal"
            style={
              {
                left: "50%",
                top: "50%",
                marginLeft: -10,
                marginTop: -16,
                transform: `rotate(${angle}deg)`,
                animationDelay: `${i * 0.08}s`,
                "--petal-rot": `${angle}deg`,
              } as React.CSSProperties
            }
          />
        ))}
        {/* Center */}
        <div
          className="bloom-center"
          style={{ left: "50%", top: "50%", marginLeft: -24, marginTop: -24 }}
        />
      </div>

      {/* Floating petals */}
      {floatingPetals.map((p) => (
        <div
          key={p.id}
          className="bloom-floating-petal"
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay + 0.3}s`,
              transform: `rotate(${p.rot}deg)`,
              "--float-rot": `${p.floatRot}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
