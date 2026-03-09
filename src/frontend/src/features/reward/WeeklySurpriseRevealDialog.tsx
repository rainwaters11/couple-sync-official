import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import WeeklySurpriseInlineSvg from "../../components/WeeklySurpriseInlineSvg";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

interface WeeklySurpriseRevealDialogProps {
  open: boolean;
  surpriseTitle: string;
  surpriseRevealMessage: string;
  surpriseSvg: string;
  /** True when in room (couple) mode — changes the reveal copy to credit the partner */
  isPartnerReveal?: boolean;
  onDismiss: () => void;
}

export default function WeeklySurpriseRevealDialog({
  open,
  surpriseTitle,
  surpriseRevealMessage,
  surpriseSvg,
  isPartnerReveal = false,
  onDismiss,
}: WeeklySurpriseRevealDialogProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [screenVisible, setScreenVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (!open) {
      setScreenVisible(false);
      setAnimationPhase(0);
      return;
    }

    if (prefersReducedMotion) {
      // Show all content immediately if reduced motion is preferred
      setScreenVisible(true);
      setAnimationPhase(4);
      return;
    }

    // Start screen fade-in immediately
    setScreenVisible(true);

    // Staged animation sequence (starts after 600ms screen fade)
    const timers = [
      setTimeout(() => setAnimationPhase(1), 600), // Header (after screen fade)
      setTimeout(() => setAnimationPhase(2), 1500), // Subtext
      setTimeout(() => setAnimationPhase(3), 2700), // Reveal title
      setTimeout(() => setAnimationPhase(4), 3900), // Card + footer
    ];

    return () => timers.forEach(clearTimeout);
  }, [open, prefersReducedMotion]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className={`ceremony-fullscreen ${screenVisible ? "screen-visible" : ""}`}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div
          className={`ceremony-content ${prefersReducedMotion ? "reduce-motion" : ""}`}
        >
          {/* Sparkle background */}
          <div className="ceremony-sparkles" aria-hidden="true" />

          {/* Content sequence */}
          <div className="ceremony-sequence">
            {/* Phase 1: Header */}
            <div
              className={`ceremony-header ${animationPhase >= 1 ? "visible" : ""}`}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center tracking-tight">
                You showed up for each other.
              </h2>
            </div>

            {/* Phase 2: Subtext */}
            <div
              className={`ceremony-subtext ${animationPhase >= 2 ? "visible" : ""}`}
            >
              <p className="text-lg md:text-xl text-white/90 text-center font-medium">
                Seven small rituals. One stronger bond.
              </p>
            </div>

            {/* Phase 3: Reveal title */}
            <div
              className={`ceremony-reveal-title ${animationPhase >= 3 ? "visible" : ""}`}
            >
              <p className="text-sm uppercase tracking-widest text-white/80 text-center font-semibold">
                {isPartnerReveal
                  ? "Surprise! Your partner planned this for you:"
                  : "Your Weekly Surprise"}
              </p>
            </div>

            {/* Phase 4: Card + footer */}
            <div
              className={`ceremony-card-wrapper ${animationPhase >= 4 ? "visible" : ""}`}
            >
              {/* Surprise card */}
              <div className="ceremony-card">
                <div className="flex flex-col items-center gap-6">
                  <WeeklySurpriseInlineSvg
                    svgString={surpriseSvg}
                    className="w-24 h-24"
                  />
                  <div className="text-center space-y-3">
                    <h3 className="text-3xl md:text-4xl font-bold text-warm-900 tracking-tight">
                      {surpriseTitle}
                    </h3>
                    <p className="text-base text-warm-700 font-medium">
                      {surpriseRevealMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <div className="ceremony-footer">
                <p className="text-base text-white/90 text-center font-medium">
                  {isPartnerReveal
                    ? "Your partner planned this shared experience for you both."
                    : "Consistency created this moment."}
                </p>
                <p className="text-lg text-white font-bold text-center mt-2">
                  Bond Level +1.
                </p>
              </div>

              {/* CTA Button */}
              <Button onClick={onDismiss} size="lg" className="ceremony-cta">
                Begin the Surprise
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
