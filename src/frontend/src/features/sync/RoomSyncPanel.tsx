import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Check,
  Copy,
  LogIn,
  LogOut,
  Plus,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRoom } from "../../hooks/useRoom";

interface RoomSyncPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RoomSyncPanel({
  open,
  onOpenChange,
}: RoomSyncPanelProps) {
  const {
    roomCode,
    partnerRole,
    isActive,
    isOffline,
    isMockLocal,
    isLoading,
    createRoom,
    joinRoom,
    leaveRoom,
    setPartnerRole,
  } = useRoom();

  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreateRoom = async () => {
    const code = await createRoom();
    if (code) {
      toast.success(`Room created: ${code}`);
    }
  };

  const handleJoinRoom = async () => {
    setJoinError("");
    const trimmed = joinCode.trim();
    if (trimmed.length < 1) {
      setJoinError("Please enter the room code.");
      return;
    }
    const result = await joinRoom(trimmed);
    if (result === "success") {
      toast.success(`Joined room: ${trimmed.toUpperCase()}`);
      setJoinCode("");
    } else if (result === "demo_fallback") {
      // Backend unreachable — demo fallback accepted the code locally
      toast.success(`Joined room: ${trimmed.toUpperCase()}`);
      setJoinCode("");
    } else {
      // result === "not_found"
      setJoinError("Room not found. Check the code and try again.");
    }
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    toast("Left room. Now in solo mode.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-sm rounded-3xl"
        data-ocid="room.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-warm-900">
            <Users className="w-5 h-5 text-warm-600" />
            Couple Sync
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Offline / demo-mode banner */}
          {isOffline && (
            <div
              className="offline-banner flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl"
              data-ocid="room.error_state"
            >
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800 font-medium">
                {isMockLocal
                  ? "Running in demo mode — blockchain sync unavailable, but the app works fully."
                  : "Room Sync unavailable — continuing in solo mode."}
              </p>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-2 px-4 py-3 bg-warm-50 rounded-xl border border-warm-200/50">
            <div
              className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-green-500" : "bg-warm-400"}`}
            />
            <span className="text-sm font-semibold text-warm-900">
              {isActive ? "Room Active" : "Solo Mode"}
            </span>
            {isActive && roomCode && (
              <span className="ml-auto text-sm font-mono font-bold text-warm-700 tracking-widest">
                {roomCode}
              </span>
            )}
          </div>

          {isActive ? (
            /* Active room controls */
            <div className="space-y-4">
              {/* Room code with copy */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-warm-700">
                  Your Room Code
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-white rounded-xl border-2 border-warm-200 font-mono text-xl font-bold text-warm-900 tracking-widest text-center">
                    {roomCode}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyCode}
                    className="h-11 w-11 rounded-xl hover:bg-warm-100"
                    data-ocid="room.secondary_button"
                    aria-label="Copy room code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-warm-600" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Partner role */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-warm-700">
                  Your Role
                </Label>
                <RadioGroup
                  value={partnerRole ?? "A"}
                  onValueChange={(v) => setPartnerRole(v as "A" | "B")}
                  className="flex gap-3"
                >
                  <div className="flex items-center gap-2 flex-1 cursor-pointer">
                    <RadioGroupItem
                      value="A"
                      id="role-a"
                      data-ocid="room.radio"
                    />
                    <Label
                      htmlFor="role-a"
                      className="cursor-pointer text-sm font-semibold text-warm-800"
                    >
                      Partner A
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 flex-1 cursor-pointer">
                    <RadioGroupItem
                      value="B"
                      id="role-b"
                      data-ocid="room.radio"
                    />
                    <Label
                      htmlFor="role-b"
                      className="cursor-pointer text-sm font-semibold text-warm-800"
                    >
                      Partner B
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Leave room */}
              <Button
                variant="ghost"
                onClick={handleLeaveRoom}
                className="w-full text-warm-600 hover:text-warm-800 hover:bg-warm-100 rounded-xl h-11 font-semibold"
                data-ocid="room.delete_button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave Room
              </Button>
            </div>
          ) : (
            /* Solo mode: create or join */
            <div className="space-y-4">
              {/* Create room */}
              <Button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="w-full bg-[#E57373] hover:bg-[#EF5350] text-white font-semibold py-3 rounded-xl shadow-sm border border-transparent"
                data-ocid="room.primary_button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Couple Mode
              </Button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-warm-200" />
                <span className="text-xs text-warm-500 font-medium">
                  or join with a code
                </span>
                <div className="flex-1 h-px bg-warm-200" />
              </div>

              {/* Join room */}
              <div className="space-y-2">
                <Input
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase().slice(0, 6));
                    setJoinError("");
                  }}
                  placeholder="Enter room code"
                  maxLength={6}
                  className="text-center font-mono text-lg tracking-widest h-12 rounded-xl border-2 border-warm-200 focus:border-warm-400 uppercase"
                  data-ocid="room.input"
                />
                {joinError && (
                  <p
                    className="text-xs text-destructive font-medium"
                    data-ocid="room.error_state"
                  >
                    {joinError}
                  </p>
                )}
                <Button
                  onClick={handleJoinRoom}
                  disabled={isLoading || joinCode.trim().length < 1}
                  variant="outline"
                  className="w-full h-11 rounded-xl border-2 border-warm-300 text-warm-800 hover:bg-warm-50 font-semibold"
                  data-ocid="room.submit_button"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Join Room
                </Button>
              </div>
            </div>
          )}

          {/* Latency note */}
          <div className="flex items-center gap-2 pt-1">
            {isActive ? (
              <Wifi className="w-3.5 h-3.5 text-warm-400 shrink-0" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-warm-400 shrink-0" />
            )}
            <p className="text-xs text-warm-500 leading-relaxed">
              Room Sync uses blockchain. Expect 2–5 second delays.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
