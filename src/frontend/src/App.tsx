import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Heart, HelpCircle, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import WeeklyProgressTab from "./features/progress/WeeklyProgressTab";
import LoveCoinFlipOverlay from "./features/reward/LoveCoinFlipOverlay";
import WeeklySurprisePickerDialog from "./features/reward/WeeklySurprisePickerDialog";
import WeeklySurpriseRevealDialog from "./features/reward/WeeklySurpriseRevealDialog";
import { getOptionById } from "./features/reward/weeklySurpriseOptions";
import SyncOfTheDayTab from "./features/ritual/SyncOfTheDayTab";
import RoomSyncPanel from "./features/sync/RoomSyncPanel";
import { useActor } from "./hooks/useActor";
import { useWeeklySurprise } from "./hooks/useWeeklySurprise";
import {
  addDays,
  getSaturdayWeekKey,
  getTodayKey,
  parseWeekKey,
} from "./lib/dates";
import {
  dismissWeekReveal,
  getWeeklySurpriseByWeek,
} from "./lib/weeklySurpriseStore";

function App() {
  const [showHelp, setShowHelp] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [showRoomPanel, setShowRoomPanel] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagStatus, setDiagStatus] = useState<string | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const [devMode, setDevMode] = useState(() => {
    return localStorage.getItem("devMode") === "true";
  });

  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem("coupleSync-onboarded") === "true";
  });

  // Lifted selected date: shared with SyncOfTheDayTab so App knows the active week.
  // This is the core fix for the picker/reveal not resetting on new weeks in devMode:
  // useWeeklySurprise must use the SAME Saturday-anchored week key that the tab uses.
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const activeDateKey = getTodayKey(activeDate);
  const activeWeekKey = getSaturdayWeekKey(parseWeekKey(activeDateKey));

  // The Saturday 7 days before the current week key — this is the "prior week".
  const previousWeekKey = getSaturdayWeekKey(
    addDays(parseWeekKey(activeWeekKey), -7),
  );
  const priorWeekData = getWeeklySurpriseByWeek(previousWeekKey);

  // Prior week reveal is pending when ALL conditions are true:
  //   1. The prior week had a selection (they chose a surprise)
  //   2. The prior week actually reached a reveal milestone (revealed===true, i.e. completedDays % 7 === 0)
  //   3. The reveal has NOT yet been dismissed (revealDismissed !== true)
  //
  // Requiring `revealed === true` prevents this from firing when the prior week only had
  // partial completions (e.g. 1-6 days done) — the reveal should only gate the picker
  // when the user genuinely earned and hasn't yet seen their Day 7 ceremony.
  //
  // Memoized so the value is stable across renders and useEffect dependency checks
  // always see the current derived value rather than a stale closure snapshot.
  const priorRevealPending = useMemo(
    () =>
      !!priorWeekData?.selectedId &&
      priorWeekData.revealed === true &&
      priorWeekData.revealDismissed !== true,
    // Re-derive whenever the prior week store data fields change
    [
      priorWeekData?.selectedId,
      priorWeekData?.revealed,
      priorWeekData?.revealDismissed,
    ],
  );

  // Track whether we are currently showing the prior week's reveal modal.
  const [showPriorReveal, setShowPriorReveal] = useState(false);

  // Guard flag: set to true the moment the user confirms a selection so the
  // useEffect below cannot re-open the picker during the async window between
  // selectOption() writing to localStorage and the react-query cache refreshing
  // hasSelection to true. Cleared as soon as hasSelection becomes true.
  const isSelectingRef = useRef(false);
  // Track which week key triggered the in-week reveal so dismissal writes to the correct key,
  // even if the user navigates to a new week while the reveal dialog is open.
  const [revealWeekKey, setRevealWeekKey] = useState<string | null>(null);

  // Read reveal option data DIRECTLY from the store (not the async query cache).
  // This is the race-condition fix: when handleRevealTrigger fires (even on mount),
  // the store always has fresh data because incrementWeeklySurpriseProgress already
  // wrote to it synchronously before justRevealed was set to true.
  const revealWeekData = getWeeklySurpriseByWeek(
    revealWeekKey ?? activeWeekKey,
  );
  const isRoomMode = !!localStorage.getItem("coupleSync-room");
  // In room mode the reveal shows the partner's surprise; in solo mode own selection.
  // For now we use the stored selectedId as the reveal source (partner ID syncing is
  // handled by usePartnerSurprise in the tab; here we just need something non-null).
  const revealSourceIdDirect = revealWeekData?.selectedId ?? null;
  const revealOptionDataDirect = revealSourceIdDirect
    ? getOptionById(revealSourceIdDirect)
    : null;
  const revealMessageDirect = revealOptionDataDirect
    ? revealOptionDataDirect.revealCopy || revealOptionDataDirect.description
    : null;

  const {
    hasSelection,
    selectedOption,
    isRoomMode: surpriseIsRoomMode,
    selectOption,
    dismissReveal,
    getOption,
  } = useWeeklySurprise(activeWeekKey);

  const { actor } = useActor();

  // Triple-tap detection state
  const [tapCount, setTapCount] = useState(0);
  const [tapTimeout, setTapTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // ON-MOUNT REVEAL CHECK — runs once when the app loads.
  //
  // If the active week (or prior week) has revealed=true and revealDismissed !== true,
  // the user earned the reveal but hasn't seen it yet (e.g. they completed Day 7 in a
  // prior session and reopened the app). Trigger the coin-flip → reveal ceremony now.
  //
  // Priority:
  //   1. Prior week undismissed reveal (handled by priorRevealPending in the effect below)
  //   2. Current/active week undismissed reveal (handled here)
  //
  // useRef ensures the check runs exactly once per mount even in React StrictMode double-invoke.
  const mountCheckDoneRef = useRef(false);
  useEffect(() => {
    if (mountCheckDoneRef.current) return;
    mountCheckDoneRef.current = true;

    // Check current/active week for an undismissed earned reveal.
    // Read directly from store — no async cache involved, always fresh on mount.
    const currentWeekData = getWeeklySurpriseByWeek(activeWeekKey);
    const currentRevealPending =
      currentWeekData != null &&
      currentWeekData.revealed === true &&
      currentWeekData.revealDismissed !== true &&
      !!currentWeekData.selectedId;

    if (currentRevealPending) {
      // Capture the week key now so dismissal writes to the right key.
      setRevealWeekKey(activeWeekKey);
      // Skip coin flip on re-mount (user already saw the completion moment);
      // go straight to the reveal ceremony.
      setShowReveal(true);
    }
    // Note: prior week reveal is handled by the priorRevealPending effect below,
    // which fires on every render when priorRevealPending becomes true — including
    // the very first render on mount.
  }, [activeWeekKey]); // activeWeekKey is stable on mount (real-today's Saturday key)

  // Single effect that enforces strict Saturday rendering priority:
  //
  //   Priority 1 — Prior week reveal:
  //     If the prior week earned a Day 7 reveal and it hasn't been dismissed,
  //     open the reveal modal immediately. The picker CANNOT open while this is true.
  //
  //   Priority 2 — New week picker:
  //     Only opens when there is no selection AND prior reveal is fully cleared.
  //     Reads priorRevealPendingRef.current (always current, never stale) instead of
  //     the `priorRevealPending` state variable, which would be stale within the same
  //     render flush when both conditions change simultaneously (the race condition).
  //
  // Using a single effect guarantees sequential evaluation — React cannot interleave
  // two separate effects reading the same state in the same commit phase.
  useEffect(() => {
    // If hasSelection just became true, the user's selection has been persisted —
    // clear the selecting guard so future week resets can open the picker normally.
    if (hasSelection) {
      isSelectingRef.current = false;
    }

    if (priorRevealPending) {
      // Priority 1: prior week reveal takes the screen exclusively.
      // Always open it; never touch the picker here.
      if (!showPriorReveal) {
        setShowPriorReveal(true);
      }
      // Explicitly ensure the picker is closed while prior reveal is pending.
      // This handles the edge case where setShowPicker(true) was already called
      // by a stale effect run before the prior reveal data was available.
      if (showPicker) {
        setShowPicker(false);
      }
      return; // <-- hard return: picker logic below never runs when reveal is pending
    }

    // Priority 2: prior reveal is gone — now open the picker if needed.
    // isSelectingRef guards against the async window between selectOption() writing
    // to localStorage and the react-query cache refreshing hasSelection to true.
    // Without this guard, the effect sees !hasSelection (still stale) and re-opens
    // the picker immediately after the user tapped "Confirm Selection".
    if (
      !hasSelection &&
      !showPicker &&
      !showPriorReveal &&
      !isSelectingRef.current &&
      !showReveal // Don't open picker while the reveal ceremony is on screen
    ) {
      setShowPicker(true);
    }
  }, [
    priorRevealPending,
    hasSelection,
    showPicker,
    showPriorReveal,
    showReveal,
  ]);

  const handleSelectOption = (optionId: string) => {
    // Set the guard BEFORE closing the picker so the useEffect dependency flush
    // that fires on setShowPicker(false) already sees isSelectingRef.current = true
    // and does not immediately re-open the picker while the query cache is stale.
    isSelectingRef.current = true;
    // Close the modal immediately (optimistic) — never block the UI.
    // selectOption writes to localStorage synchronously and fires the
    // ICP backend call in the background with its own try/catch.
    setShowPicker(false);
    selectOption(optionId);
  };

  const handleDismissReveal = () => {
    // Dismiss using the week key that was active when the reveal was triggered (not
    // the current activeWeekKey which may have already rolled to the next Saturday).
    const weekToDissmiss = revealWeekKey ?? activeWeekKey;
    dismissWeekReveal(weekToDissmiss);
    dismissReveal(); // also updates the react-query cache for the current hook
    setRevealWeekKey(null);
    setShowReveal(false);
  };

  // Dismiss the PRIOR week's reveal: mark revealDismissed=true for previousWeekKey,
  // close the prior reveal modal, then (if the current week has no selection) open
  // the new-week picker. This enforces the strict Saturday rendering priority.
  const handleDismissPriorReveal = () => {
    dismissWeekReveal(previousWeekKey);
    setShowPriorReveal(false);
    // Open the new-week picker immediately after dismissal if there is no selection yet.
    if (!hasSelection) {
      setShowPicker(true);
    }
  };

  const handleRevealTrigger = () => {
    // Always fire when justRevealed is signalled from markComplete — that is the
    // authoritative source of truth. Do NOT gate on revealDismissed here: the
    // react-query cache may still hold a stale revealDismissed=true value from a
    // prior week, silently blocking every subsequent weekly reveal.
    //
    // Capture the week key at the moment the reveal fires (Friday's active week)
    // so dismissal writes to the correct key even if the user navigates to Saturday
    // while the dialog is still open.
    setRevealWeekKey(activeWeekKey);
    // Block the picker from opening while the coin flip + reveal are showing.
    setShowPicker(false);
    // Show coin flip first, then reveal dialog
    setShowCoinFlip(true);
  };

  const handleCoinFlipComplete = () => {
    setShowCoinFlip(false);
    setShowReveal(true);
  };

  const handleTitleClick = () => {
    if (tapTimeout) clearTimeout(tapTimeout);
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    if (newTapCount === 3) {
      const newDevMode = !devMode;
      setDevMode(newDevMode);
      localStorage.setItem("devMode", String(newDevMode));
      toast(newDevMode ? "Test Mode enabled" : "Test Mode disabled", {
        duration: 2000,
      });
      setTapCount(0);
      setTapTimeout(null);
    } else {
      const timeout = setTimeout(() => {
        setTapCount(0);
        setTapTimeout(null);
      }, 2000);
      setTapTimeout(timeout);
    }
  };

  const handleDismissOnboarding = () => {
    localStorage.setItem("coupleSync-onboarded", "true");
    setIsOnboarded(true);
  };

  const handleCheckDiagnostics = async () => {
    setDiagLoading(true);
    setDiagStatus(null);
    try {
      if (!actor) {
        setDiagStatus("Actor not initialized — backend may be loading.");
        return;
      }
      const result = await actor.checkRoomSyncStatus("test");
      setDiagStatus(
        `Status: OK | Exists: ${result.exists} | Completed: ${result.completedCount} | Last Sync: ${new Date(Number(result.lastSyncTime) / 1_000_000).toLocaleTimeString()}`,
      );
    } catch (err) {
      setDiagStatus(
        `Error: ${err instanceof Error ? err.message : "Backend unreachable"}`,
      );
    } finally {
      setDiagLoading(false);
    }
  };

  const selectedOptionData = selectedOption ? getOption(selectedOption) : null;
  // For the reveal ceremony, use data read DIRECTLY from the store (revealOptionDataDirect)
  // rather than the async query cache. This eliminates the race condition where the cache
  // hasn't refreshed yet when handleRevealTrigger fires, causing a null revealOptionData
  // and a blank/skipped ceremony.
  // revealOptionDataDirect and revealMessageDirect are computed above from revealWeekKey.

  // Prior week reveal data — uses the prior week's own selectedId (solo) or a
  // mocked/fallback partner ID if available. For simplicity we show the prior
  // week's own selection (the surprise the user chose to plan for their partner).
  const priorRevealOptionData = priorWeekData?.selectedId
    ? getOption(priorWeekData.selectedId)
    : null;
  const priorRevealMessage = priorRevealOptionData
    ? priorRevealOptionData.revealCopy || priorRevealOptionData.description
    : null;

  const canisterId: string =
    (import.meta as unknown as { env?: { VITE_CANISTER_ID_BACKEND?: string } })
      .env?.VITE_CANISTER_ID_BACKEND || "Not configured";

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-peach to-amber relative overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.95_0.06_30/0.4),transparent_50%),radial-gradient(circle_at_70%_80%,oklch(0.88_0.08_35/0.3),transparent_50%)]" />

      <div className="relative container mx-auto px-4 py-10 max-w-md">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            type="button"
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={handleTitleClick}
            aria-label="Couple Sync — triple tap to toggle dev mode"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-rose-500"
              aria-hidden="true"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <span className="font-display text-2xl font-bold text-warm-900 tracking-tight">
              Couple Sync
            </span>
            {devMode && (
              <span className="text-xs font-bold bg-warm-500 text-white px-1.5 py-0.5 rounded-md ml-1">
                DEV
              </span>
            )}
          </button>

          <div className="flex items-center gap-1">
            {/* How it works */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHelp(true)}
              className="h-9 w-9 rounded-xl hover:bg-warm-100 text-warm-600"
              aria-label="How it works"
              data-ocid="nav.open_modal_button"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>

            {/* Room sync */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowRoomPanel(true)}
              className="h-9 w-9 rounded-xl hover:bg-warm-100 text-warm-600"
              aria-label="Room Sync"
              data-ocid="room.open_modal_button"
            >
              <Users className="w-5 h-5" />
            </Button>

            {/* Diagnostics */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDiagnostics(true)}
              className="h-9 w-9 rounded-xl hover:bg-warm-100 text-warm-600"
              aria-label="IC Diagnostics"
              data-ocid="diag.open_modal_button"
            >
              <Activity className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Main Tabs */}
        <main>
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-7 h-auto p-1.5 bg-white/60 backdrop-blur-md rounded-2xl shadow-soft border border-warm-200/50">
              <TabsTrigger
                value="today"
                className="text-sm py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-rose-600 data-[state=active]:font-semibold data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500 hover:data-[state=inactive]:text-gray-700 font-medium rounded-lg transition-all"
                data-ocid="app.tab"
              >
                Sync of the Day
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="text-sm py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-rose-600 data-[state=active]:font-semibold data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500 hover:data-[state=inactive]:text-gray-700 font-medium rounded-lg transition-all"
                data-ocid="app.tab"
              >
                Weekly Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-0">
              <SyncOfTheDayTab
                devMode={devMode}
                onRevealTrigger={handleRevealTrigger}
                isOnboarded={isOnboarded}
                onDismissOnboarding={handleDismissOnboarding}
                selectedDate={activeDate}
                onSelectedDateChange={setActiveDate}
              />
            </TabsContent>

            <TabsContent value="progress" className="mt-0">
              <WeeklyProgressTab />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="mt-16 pb-6 text-center text-xs text-warm-700/60">
          <p>
            &copy; {new Date().getFullYear()}. Built with{" "}
            <Heart className="inline w-3 h-3 fill-warm-500 text-warm-500" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-warm-700 transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      {/* How It Works Modal */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent
          className="sm:max-w-sm rounded-3xl"
          data-ocid="nav.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-warm-900">
              <Heart className="w-5 h-5 text-warm-600 fill-warm-600" />
              How It Works
            </DialogTitle>
            <DialogDescription className="text-left space-y-5 pt-4">
              <div>
                <h4 className="font-bold text-foreground mb-1.5 text-base">
                  Room Code
                </h4>
                <p className="text-sm leading-relaxed">
                  Create a room and share the 6-digit code with your partner.
                  Join on any device, no login needed.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1.5 text-base">
                  Daily Ritual
                </h4>
                <p className="text-sm leading-relaxed">
                  Each day, complete one small ritual together and mark it done.
                  Come back tomorrow for the next one.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1.5 text-base">
                  Day 7 Reveal
                </h4>
                <p className="text-sm leading-relaxed">
                  Complete 7 days and unlock your Weekly Surprise — a reward you
                  both chose at the start of the week.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowHelp(false)}
            className="mt-2 bg-warm-500 hover:bg-warm-600 text-white rounded-xl font-bold"
            data-ocid="nav.close_button"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>

      {/* IC Deployment Diagnostics */}
      <Dialog open={showDiagnostics} onOpenChange={setShowDiagnostics}>
        <DialogContent
          className="sm:max-w-sm rounded-3xl"
          data-ocid="diag.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-warm-900">
              <Activity className="w-5 h-5 text-warm-600" />
              IC Deployment Diagnostics
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-warm-50 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-warm-700">Canister ID</span>
                <span className="font-mono text-xs text-warm-900 truncate max-w-[140px]">
                  {canisterId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-warm-700">Network</span>
                <span className="text-warm-900 text-xs">IC Mainnet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-warm-700">Local Time</span>
                <span className="text-warm-900 text-xs">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            {diagStatus && (
              <div
                className="bg-white rounded-xl p-3 border border-warm-200 text-xs text-warm-800 font-mono leading-relaxed"
                data-ocid="diag.success_state"
              >
                {diagStatus}
              </div>
            )}

            <Button
              onClick={handleCheckDiagnostics}
              disabled={diagLoading}
              className="w-full bg-warm-600 hover:bg-warm-700 text-white font-bold rounded-xl"
              data-ocid="diag.primary_button"
            >
              {diagLoading ? "Checking…" : "Check Status"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDiagnostics(false)}
              className="w-full text-warm-600 hover:bg-warm-100 rounded-xl"
              data-ocid="diag.close_button"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Room Sync Panel */}
      <RoomSyncPanel open={showRoomPanel} onOpenChange={setShowRoomPanel} />

      {/* Prior Week Reveal — must be seen and dismissed before the new-week picker appears */}
      {priorRevealOptionData && priorRevealMessage && (
        <WeeklySurpriseRevealDialog
          open={showPriorReveal}
          surpriseTitle={priorRevealOptionData.title}
          surpriseRevealMessage={priorRevealMessage}
          surpriseSvg={priorRevealOptionData.svg}
          isPartnerReveal={surpriseIsRoomMode}
          onDismiss={handleDismissPriorReveal}
        />
      )}

      {/* Weekly Surprise Picker — blocked while prior week reveal is on screen */}
      <WeeklySurprisePickerDialog
        open={showPicker && !showPriorReveal && !priorRevealPending}
        onSelect={handleSelectOption}
        onSkip={() => setShowPicker(false)}
      />

      {/* Love Coin Flip Overlay — before reveal.
          Always render when showCoinFlip is true; provide a fallback title so
          the animation never gets silently skipped due to a null option lookup. */}
      {showCoinFlip && (
        <LoveCoinFlipOverlay
          open={showCoinFlip}
          surpriseTitle={selectedOptionData?.title ?? "Your Weekly Surprise"}
          onComplete={handleCoinFlipComplete}
        />
      )}

      {/* Weekly Surprise Reveal — always render when showReveal is true so the
          dialog is never silently swallowed by a null revealOptionData/revealMessage.
          Uses revealOptionDataDirect (read straight from localStorage store) to avoid
          the async cache race condition where the cache hasn't refreshed yet.
          Provide fallback text so the ceremony still runs even if option lookup misses. */}
      {showReveal && (
        <WeeklySurpriseRevealDialog
          open={showReveal}
          surpriseTitle={
            revealOptionDataDirect?.title ?? "Your Weekly Surprise"
          }
          surpriseRevealMessage={
            revealMessageDirect ??
            revealOptionDataDirect?.description ??
            "You showed up every day. That's what love looks like."
          }
          surpriseSvg={revealOptionDataDirect?.svg ?? ""}
          isPartnerReveal={isRoomMode}
          onDismiss={handleDismissReveal}
        />
      )}

      <Toaster />
    </div>
  );
}

export default App;
