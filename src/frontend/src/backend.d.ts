import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RoomSurpriseState {
    creatorSurpriseId: string;
    exists: boolean;
    joinerSurpriseId: string;
}
export interface RoomSyncStatus {
    completedCount: bigint;
    exists: boolean;
    lastSyncTime: bigint;
}
export interface backendInterface {
    checkRoomSyncStatus(roomCode: string): Promise<RoomSyncStatus>;
    createRoom(): Promise<string>;
    getRoomSurprises(code: string): Promise<RoomSurpriseState>;
    joinRoom(code: string): Promise<boolean>;
    updateRoleSurprise(code: string, role: string, surpriseId: string): Promise<boolean>;
    updateRoomState(code: string, date: string, surpriseId: string): Promise<boolean>;
}
