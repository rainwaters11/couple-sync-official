/**
 * useRoomSync — lightweight hook for pushing state updates to the ICP backend.
 *
 * Reads the active roomCode and partnerRole from localStorage. If no room is
 * active, all pushes are no-ops. All ICP calls are wrapped in try/catch so a
 * backend failure never crashes the app; it simply sets the offline flag.
 */
import { useCallback } from "react";
import { useActor } from "./useActor";

const ROOM_STORAGE_KEY = "coupleSync-room";
const OFFLINE_FLAG_KEY = "coupleSync-roomOffline";

function getStoredRoomCode(): string | null {
  try {
    const stored = localStorage.getItem(ROOM_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { roomCode?: string };
    return parsed.roomCode || null;
  } catch {
    return null;
  }
}

function getStoredRole(): "A" | "B" | null {
  try {
    const stored = localStorage.getItem(ROOM_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { partnerRole?: string };
    const role = parsed.partnerRole;
    if (role === "A" || role === "B") return role;
    return null;
  } catch {
    return null;
  }
}

function markOffline(): void {
  try {
    localStorage.setItem(OFFLINE_FLAG_KEY, "true");
  } catch {
    // Fail silently
  }
}

export function useRoomSync() {
  const { actor } = useActor();

  /**
   * Push a room state update to the backend (legacy — date completions).
   * @param date - ISO date string (YYYY-MM-DD) for a newly completed ritual,
   *               or "" if only updating the surprise selection.
   * @param surpriseId - The selected surprise option ID, or "" if not changing.
   */
  const pushRoomUpdate = useCallback(
    async (date: string, surpriseId: string): Promise<void> => {
      const roomCode = getStoredRoomCode();
      if (!roomCode || !actor) {
        // No active room or actor not ready — silently skip
        return;
      }

      try {
        await actor.updateRoomState(roomCode, date, surpriseId);
      } catch (err) {
        // Backend unreachable (DNS error, timeout, etc.) — mark offline and
        // continue in solo mode.
        markOffline();
        if (process.env.NODE_ENV !== "production") {
          console.warn("[RoomSync] updateRoomState failed — solo mode:", err);
        }
      }
    },
    [actor],
  );

  /**
   * Push the user's own surprise selection to their role-specific backend slot.
   * Creator (Role A) writes to creatorSurpriseId.
   * Joiner  (Role B) writes to joinerSurpriseId.
   * No-ops if not in a room or backend is unavailable.
   */
  const pushRoleSurpriseUpdate = useCallback(
    async (surpriseId: string): Promise<void> => {
      const roomCode = getStoredRoomCode();
      const role = getStoredRole();
      if (!roomCode || !role || !actor) {
        return;
      }

      try {
        await actor.updateRoleSurprise(roomCode, role, surpriseId);
      } catch (err) {
        markOffline();
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[RoomSync] updateRoleSurprise failed — solo mode:",
            err,
          );
        }
      }
    },
    [actor],
  );

  return { pushRoomUpdate, pushRoleSurpriseUpdate };
}
