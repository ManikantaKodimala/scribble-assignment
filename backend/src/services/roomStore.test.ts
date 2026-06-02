import { describe, expect, it } from "vitest";
import { createRoom, joinRoom, selectWord, startGame, toRoomSnapshot } from "./roomStore.js";

describe("roomStore", () => {
  it("createRoom returns a room with a 4-character uppercase code", () => {
    const result = createRoom("Alice");

    expect(result.room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(result.room.participants).toHaveLength(1);
    expect(result.room.participants[0].name).toBe("Alice");
    expect(result.participantId).toBeDefined();
  });

  it("trims leading and trailing whitespace from player name on createRoom", () => {
    const result = createRoom("  Alice  ");

    expect(result.room.participants[0].name).toBe("Alice");
  });

  it("rejects empty player name on createRoom", () => {
    expect(() => createRoom("")).toThrow("Player name is required");
  });

  it("rejects whitespace-only player name on createRoom", () => {
    expect(() => createRoom("   ")).toThrow("Player name is required");
  });

  it("joinRoom returns null for an unknown room code", () => {
    const result = joinRoom("ZZZZ", "Bob");

    expect(result).toBeNull();
  });

  describe("startGame", () => {
    it("creates round 1 with host as drawer and a secret word", () => {
      const { room } = createRoom("Alice");
      joinRoom(room.code, "Bob");
      const startedRoom = startGame(room.code, room.hostId)!;

      expect(startedRoom.currentRound).not.toBeNull();
      expect(startedRoom.currentRound!.number).toBe(1);
      expect(startedRoom.currentRound!.drawerId).toBe(room.hostId);
      expect(startedRoom.currentRound!.word).toBeDefined();
      expect(startedRoom.currentRound!.word.length).toBeGreaterThan(0);
    });
  });

  describe("toRoomSnapshot", () => {
    it("includes secretWord when viewer is the drawer", () => {
      const { room, participantId } = createRoom("Alice");
      joinRoom(room.code, "Bob");
      const started = startGame(room.code, participantId)!;
      const snapshot = toRoomSnapshot(started, participantId);

      expect(snapshot.drawerId).toBe(participantId);
      expect(snapshot.secretWord).toBeDefined();
      expect(snapshot.secretWord!.length).toBeGreaterThan(0);
    });

    it("excludes secretWord for non-drawer viewers", () => {
      const { room: aliceRoom, participantId: aliceId } = createRoom("Alice");
      joinRoom(aliceRoom.code, "Bob");

      const started = startGame(aliceRoom.code, aliceId)!;
      const guesserSnapshot = toRoomSnapshot(started, "non-drawer-id");

      expect(guesserSnapshot.secretWord).toBeUndefined();
      expect(guesserSnapshot.drawerId).toBe(aliceId);
    });
  });

  describe("selectWord", () => {
    it("selectWord returns the same word for the same room code", () => {
      const word1 = selectWord("ABCD", 1);
      const word2 = selectWord("ABCD", 1);

      expect(word1).toBe(word2);
    });

    it("selectWord cycles through the word list when round number exceeds list length", () => {
      const word1 = selectWord("ABCD", 1);
      const word100 = selectWord("ABCD", 100);

      expect(word100).toBeDefined();
    });
  });
});
