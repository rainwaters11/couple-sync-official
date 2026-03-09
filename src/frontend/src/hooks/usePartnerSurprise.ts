/**
 * usePartnerSurprise
 *
 * Fetches the partner's surprise ID from the ICP backend on demand.
 * - Creator (Role A) sees the joiner's surprise  (joinerSurpriseId)
 * - Joiner  (Role B) sees the creator's surprise (creatorSurpriseId)
 * - Solo Mode (no room) returns null — callers fall back to own selection
 *
 * NO timers. Fetch is triggered:
 *   1. Once on mount (via useQuery with staleTime=0)
 *   2. Imperatively via refetchPartnerSurprise() — call this after markComplete
 *
 * On any backend failure the hook silently returns null and the app
 * continues in solo mode.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useActor } from "./useActor";
import { getStoredDemoPartnerSurprise, getStoredPartnerRole } from "./useRoom";

const ROOM_STORAGE_KEY = "coupleSync-room";

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

function isMockLocalRoom(): boolean {
  try {
    const stored = localStorage.getItem(ROOM_STORAGE_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored) as { isMockLocal?: boolean };
    return !!parsed.isMockLocal;
  } catch {
    return false;
  }
}

export function usePartnerSurprise() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const roomCode = getStoredRoomCode();
  const myRole = getStoredPartnerRole(); // "A" | "B" | null
  const isInRoom = !!roomCode && !!myRole;

  // ── DEMO FALLBACK ───────────────────────────────────────────────────────────
  // When the room is running in mock-local mode (backend unreachable), read the
  // hardcoded partner surprise that was injected into localStorage by useRoom.ts
  // at the moment createRoom/joinRoom fell back. This bypasses the backend query
  // entirely so clues and the Day 7 reveal populate without network consensus.
  const demoPartnerSurprise = isMockLocalRoom()
    ? getStoredDemoPartnerSurprise()
    : null;

  const { data: partnerSurpriseId = null, isLoading: isFetchingPartner } =
    useQuery<string | null>({
      queryKey: ["partner-surprise", roomCode, myRole],
      // Skip the backend call when we already have a mocked value
      enabled: isInRoom && !!actor && !demoPartnerSurprise,
      // staleTime=0 so re-mounting always triggers a fresh fetch
      staleTime: 0,
      // If in demo mode, return the mocked value immediately without hitting backend
      initialData: demoPartnerSurprise ?? undefined,
      queryFn: async (): Promise<string | null> => {
        if (!actor || !roomCode) return null;
        try {
          const state = await actor.getRoomSurprises(roomCode);
          if (!state.exists) return null;

          // Cross-hint: each partner sees the OTHER person's surprise
          if (myRole === "A") {
            // Creator sees joiner's surprise
            return state.joinerSurpriseId || null;
          }
          // Joiner sees creator's surprise
          return state.creatorSurpriseId || null;
        } catch {
          // Backend unreachable — return null, app continues in solo mode
          return null;
        }
      },
    });

  /**
   * Imperatively re-fetch the partner's surprise ID.
   * Call this immediately after a successful markComplete.
   */
  const refetchPartnerSurprise = useCallback(() => {
    if (isInRoom) {
      queryClient.invalidateQueries({
        queryKey: ["partner-surprise", roomCode, myRole],
      });
    }
  }, [isInRoom, roomCode, myRole, queryClient]);

  return {
    partnerSurpriseId,
    isFetchingPartner,
    isInRoom,
    myRole,
    refetchPartnerSurprise,
  };
}
