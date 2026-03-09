import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { useActor } from "./useActor";

export interface RoomState {
  roomCode: string;
  partnerRole: "A" | "B";
  isActive: boolean;
  isMockLocal?: boolean; // true when backend was unreachable and we fell back
}

const ROOM_STORAGE_KEY = "coupleSync-room";
const PARTNER_ROLE_KEY = "coupleSync-partnerRole";

// Demo fallback: hardcoded partner surprise IDs injected when backend is unreachable.
// Role A (creator) → their partner (B) chose 'breakfast_date'.
// Role B (joiner)  → their partner (A) chose 'movie_night'.
const DEMO_PARTNER_SURPRISE_KEY = "coupleSync-demoPartnerSurpriseId";
const DEMO_PARTNER_SURPRISE: Record<"A" | "B", string> = {
  A: "breakfast_date",
  B: "movie_night",
};

function loadRoomState(): RoomState | null {
  try {
    const stored = localStorage.getItem(ROOM_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as RoomState;
  } catch {
    return null;
  }
}

function saveRoomState(state: RoomState): void {
  try {
    localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(PARTNER_ROLE_KEY, state.partnerRole);
  } catch {
    // Fail silently
  }
}

function clearRoomState(): void {
  try {
    localStorage.removeItem(ROOM_STORAGE_KEY);
    localStorage.removeItem(PARTNER_ROLE_KEY);
    localStorage.removeItem(DEMO_PARTNER_SURPRISE_KEY);
  } catch {
    // Fail silently
  }
}

export function getStoredDemoPartnerSurprise(): string | null {
  try {
    return localStorage.getItem(DEMO_PARTNER_SURPRISE_KEY) || null;
  } catch {
    return null;
  }
}

export function getStoredPartnerRole(): "A" | "B" | null {
  const role = localStorage.getItem(PARTNER_ROLE_KEY);
  if (role === "A" || role === "B") return role;
  return null;
}

function generateLocalCode(): string {
  // 6-digit numeric code for demo fallback (easy to type on second device)
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function useRoom() {
  const queryClient = useQueryClient();
  const { actor, isFetching } = useActor();
  // Keep a ref so the polling closure can always see the latest actor value
  const actorRef = useRef(actor);
  actorRef.current = actor;

  const [roomState, setRoomStateLocal] = useState<RoomState | null>(() =>
    loadRoomState(),
  );
  // Do not restore the offline banner from localStorage on mount —
  // it caused the "Room Sync unavailable" message to appear every time
  // the modal was opened even when the backend was healthy.
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roomCode = roomState?.roomCode ?? null;
  const partnerRole = roomState?.partnerRole ?? null;
  const isActive = roomState?.isActive ?? false;
  const isMockLocal = roomState?.isMockLocal ?? false;

  /**
   * Wait up to `maxMs` for the actor to become available by polling the ref.
   * Returns the actor if it resolves, or null if timeout expires.
   */
  const waitForActor = useCallback((maxMs = 6000) => {
    return new Promise<typeof actor>((resolve) => {
      if (actorRef.current) {
        resolve(actorRef.current);
        return;
      }
      const start = Date.now();
      const interval = setInterval(() => {
        if (actorRef.current) {
          clearInterval(interval);
          resolve(actorRef.current);
        } else if (Date.now() - start > maxMs) {
          clearInterval(interval);
          resolve(null);
        }
      }, 250);
    });
  }, []);

  const createRoom = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const resolvedActor = await waitForActor();
      if (!resolvedActor) {
        console.error(
          "MOTOKO ERROR: actor is null/undefined after waiting — ICP agent did not initialise",
        );
        throw new Error("actor unavailable");
      }
      // Backend generates and returns the room code
      const code = await resolvedActor.createRoom();
      if (code && code.length > 0) {
        const newState: RoomState = {
          roomCode: code,
          partnerRole: "A",
          isActive: true,
          isMockLocal: false,
        };
        saveRoomState(newState);
        setRoomStateLocal(newState);
        setIsOffline(false);
        localStorage.removeItem("coupleSync-roomOffline");
        queryClient.invalidateQueries({ queryKey: ["room"] });
        return code;
      }
      throw new Error("backend returned empty room code");
    } catch (err) {
      // ── DEMO FALLBACK ──────────────────────────────────────────────────────
      // Backend failed or timed out. Generate a local 6-digit code and push
      // the user into the room UI as Role A so the demo is never blocked.
      console.error("MOTOKO ERROR (createRoom):", err);
      const code = generateLocalCode();
      const newState: RoomState = {
        roomCode: code,
        partnerRole: "A",
        isActive: true,
        isMockLocal: true,
      };
      saveRoomState(newState);
      setRoomStateLocal(newState);
      setIsOffline(true);
      // Inject mocked partner surprise so clues + Day 7 reveal populate instantly.
      // Role A's "partner" is B → B chose breakfast_date.
      localStorage.setItem(DEMO_PARTNER_SURPRISE_KEY, DEMO_PARTNER_SURPRISE.A);
      return code;
    } finally {
      setIsLoading(false);
    }
  }, [waitForActor, queryClient]);

  const joinRoom = useCallback(
    async (
      code: string,
    ): Promise<"success" | "not_found" | "demo_fallback"> => {
      setIsLoading(true);
      try {
        const resolvedActor = await waitForActor();
        if (!resolvedActor) {
          console.error(
            "MOTOKO ERROR: actor is null/undefined after waiting — ICP agent did not initialise",
          );
          throw new Error("actor unavailable");
        }

        const trimmedCode = code.trim().toUpperCase();
        const exists = await resolvedActor.joinRoom(trimmedCode);
        if (exists) {
          const newState: RoomState = {
            roomCode: trimmedCode,
            partnerRole: "B",
            isActive: true,
            isMockLocal: false,
          };
          saveRoomState(newState);
          setRoomStateLocal(newState);
          setIsOffline(false);
          localStorage.removeItem("coupleSync-roomOffline");
          queryClient.invalidateQueries({ queryKey: ["room"] });
          return "success";
        }
        // Room code was valid but room doesn't exist on backend
        return "not_found";
      } catch (err) {
        // ── DEMO FALLBACK ──────────────────────────────────────────────────────
        // Backend failed or timed out. Accept the entered code locally and push
        // the user into the room UI as Role B so the demo is never blocked.
        console.error("MOTOKO ERROR (joinRoom):", err);
        const trimmedCode = code.trim().toUpperCase();
        const newState: RoomState = {
          roomCode: trimmedCode,
          partnerRole: "B",
          isActive: true,
          isMockLocal: true,
        };
        saveRoomState(newState);
        setRoomStateLocal(newState);
        setIsOffline(true);
        // Inject mocked partner surprise so clues + Day 7 reveal populate instantly.
        // Role B's "partner" is A → A chose movie_night.
        localStorage.setItem(
          DEMO_PARTNER_SURPRISE_KEY,
          DEMO_PARTNER_SURPRISE.B,
        );
        queryClient.invalidateQueries({ queryKey: ["room"] });
        return "demo_fallback";
      } finally {
        setIsLoading(false);
      }
    },
    [waitForActor, queryClient],
  );

  const leaveRoom = useCallback(() => {
    clearRoomState();
    setRoomStateLocal(null);
    setIsOffline(false);
    queryClient.invalidateQueries({ queryKey: ["room"] });
  }, [queryClient]);

  const setPartnerRole = useCallback((role: "A" | "B") => {
    setRoomStateLocal((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, partnerRole: role };
      saveRoomState(updated);
      return updated;
    });
  }, []);

  return {
    roomCode,
    partnerRole,
    isActive,
    isOffline,
    isMockLocal,
    isLoading: isLoading || isFetching,
    createRoom,
    joinRoom,
    leaveRoom,
    setPartnerRole,
  };
}
