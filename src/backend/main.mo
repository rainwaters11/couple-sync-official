import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import Text "mo:core/Text";



actor {
  public type RoomData = {
    completedDates : [Text];
    selectedSurpriseId : Text; // legacy
    creatorSurpriseId : Text;
    joinerSurpriseId : Text;
    lastSyncTime : Int;
    createdAt : Int;
  };

  public type RoomSyncStatus = {
    exists : Bool;
    lastSyncTime : Int;
    completedCount : Nat;
  };

  public type RoomSurpriseState = {
    exists : Bool;
    creatorSurpriseId : Text;
    joinerSurpriseId : Text;
  };

  let rooms = Map.empty<Text, RoomData>();

  public shared ({ caller }) func createRoom() : async Text {
    for (attempt in Nat.range(0, 10)) {
      let baseCode = Int.abs(Time.now()) % 1_000_000 : Nat;
      let roomCode = (baseCode % 100_000 + attempt).toText();
      if (not rooms.containsKey(roomCode)) {
        let newRoom : RoomData = {
          completedDates = [];
          selectedSurpriseId = "";
          creatorSurpriseId = "";
          joinerSurpriseId = "";
          lastSyncTime = Time.now();
          createdAt = Time.now();
        };
        rooms.add(roomCode, newRoom);
        return roomCode;
      };
    };
    "";
  };

  public query ({ caller }) func joinRoom(code : Text) : async Bool {
    rooms.containsKey(code);
  };

  public shared ({ caller }) func updateRoomState(code : Text, date : Text, surpriseId : Text) : async Bool {
    switch (rooms.get(code)) {
      case (null) { false };
      case (?roomData) {
        let updatedDates = if (date != "" and not roomData.completedDates.any(func(d) { d == date })) {
          roomData.completedDates.concat([date]);
        } else {
          roomData.completedDates;
        };

        let updatedSurpriseId = if (surpriseId != "") { surpriseId } else {
          roomData.selectedSurpriseId;
        };

        rooms.add(
          code,
          {
            completedDates = updatedDates;
            selectedSurpriseId = updatedSurpriseId;
            creatorSurpriseId = roomData.creatorSurpriseId; // keep as is
            joinerSurpriseId = roomData.joinerSurpriseId; // keep as is
            lastSyncTime = Time.now();
            createdAt = roomData.createdAt;
          },
        );
        true;
      };
    };
  };

  public shared ({ caller }) func updateRoleSurprise(code : Text, role : Text, surpriseId : Text) : async Bool {
    switch (rooms.get(code)) {
      case (null) { false };
      case (?roomData) {
        let (newCreatorId, newJoinerId) = switch (Text.equal(role, "A"), Text.equal(role, "B")) {
          case (true, _) {
            (surpriseId, roomData.joinerSurpriseId);
          };
          case (_, true) {
            (roomData.creatorSurpriseId, surpriseId);
          };
          case (_) { (roomData.creatorSurpriseId, roomData.joinerSurpriseId) };
        };

        rooms.add(
          code,
          {
            roomData with
            creatorSurpriseId = newCreatorId;
            joinerSurpriseId = newJoinerId;
          },
        );
        true;
      };
    };
  };

  public query ({ caller }) func getRoomSurprises(code : Text) : async RoomSurpriseState {
    switch (rooms.get(code)) {
      case (null) {
        {
          exists = false;
          creatorSurpriseId = "";
          joinerSurpriseId = "";
        };
      };
      case (?roomData) {
        {
          exists = true;
          creatorSurpriseId = roomData.creatorSurpriseId;
          joinerSurpriseId = roomData.joinerSurpriseId;
        };
      };
    };
  };

  public query ({ caller }) func checkRoomSyncStatus(roomCode : Text) : async RoomSyncStatus {
    switch (rooms.get(roomCode)) {
      case (null) {
        {
          exists = false;
          lastSyncTime = 0;
          completedCount = 0;
        };
      };
      case (?roomData) {
        {
          exists = true;
          lastSyncTime = roomData.lastSyncTime;
          completedCount = roomData.completedDates.size();
        };
      };
    };
  };
};

