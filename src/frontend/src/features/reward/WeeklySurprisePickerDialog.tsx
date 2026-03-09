import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import WeeklySurpriseInlineSvg from "../../components/WeeklySurpriseInlineSvg";
import { WEEKLY_SURPRISE_OPTIONS } from "./weeklySurpriseOptions";

interface WeeklySurprisePickerDialogProps {
  open: boolean;
  onSelect: (option: string) => void;
  onSkip: () => void;
}

export default function WeeklySurprisePickerDialog({
  open,
  onSelect,
  onSkip,
}: WeeklySurprisePickerDialogProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Reset selection every time the dialog opens so stale state from a previous
  // open/close cycle never causes the first click to appear to do nothing.
  useEffect(() => {
    if (open) {
      setSelectedOption(null);
    }
  }, [open]);

  // Tapping an option highlights it and enables the Confirm button.
  // The user must then tap "Confirm Selection" to finalize — prevents accidental picks.
  const handleOptionClick = (optionId: string) => {
    setSelectedOption(optionId);
  };

  // Confirm is only callable once an option is highlighted.
  // Reads selectedOption directly from state at call time (no stale closure).
  const handleConfirm = () => {
    if (!selectedOption) return;
    onSelect(selectedOption);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onSkip();
      }}
    >
      <DialogContent className="sm:max-w-md flex flex-col max-h-[90dvh] p-0 gap-0">
        {/* Fixed header */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Gift className="w-6 h-6 text-warm-600" />
              Weekly Surprise
            </DialogTitle>
            <DialogDescription className="text-left pt-3">
              <p className="text-base leading-relaxed text-warm-800">
                Choose a reward to work towards this week. Complete 7 days of
                rituals to reveal your surprise!
              </p>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable options list */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-3 min-h-0">
          {WEEKLY_SURPRISE_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={`flex items-center gap-4 p-4 border rounded-xl w-full text-left transition-all ${
                selectedOption === option.id
                  ? "border-warm-500 bg-warm-50 shadow-md"
                  : "border-warm-200 bg-white hover:border-warm-300 hover:bg-warm-50/50"
              }`}
            >
              <div className="w-14 h-14 flex-shrink-0 rounded-lg flex items-center justify-center bg-warm-50 overflow-hidden">
                <WeeklySurpriseInlineSvg
                  svgString={option.svg}
                  className="w-10 h-10"
                />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-lg font-semibold text-warm-900">
                  {option.title}
                </p>
                <p className="text-xs text-warm-700 mt-0.5">
                  {option.description}
                </p>
              </div>
              {selectedOption === option.id && (
                <Sparkles className="w-5 h-5 text-warm-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Fixed footer — always visible */}
        <div className="px-6 pb-6 pt-4 shrink-0 space-y-2 border-t border-warm-100 bg-white">
          <Button
            onClick={handleConfirm}
            disabled={!selectedOption}
            size="lg"
            className="w-full bg-[#E57373] hover:bg-[#EF5350] text-white font-semibold py-3 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            data-ocid="weekly-surprise-picker.confirm_button"
          >
            Confirm Selection
          </Button>
          <Button
            variant="ghost"
            onClick={onSkip}
            className="w-full text-warm-600 hover:bg-warm-100 rounded-xl text-sm"
            data-ocid="weekly-surprise-picker.cancel_button"
          >
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
