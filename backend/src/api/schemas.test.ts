import { describe, expect, it } from "vitest";
import { createRoomSchema, joinRoomSchema, roomCodeParamsSchema } from "./schemas.js";

describe("schemas", () => {
  describe("createRoomSchema", () => {
    it("accepts a valid body with playerName", () => {
      const result = createRoomSchema.parse({ playerName: "Alice" });

      expect(result.playerName).toBe("Alice");
    });

    it("rejects empty playerName", () => {
      expect(() => createRoomSchema.parse({ playerName: "" })).toThrow("Player name is required");
    });

    it("rejects whitespace-only playerName", () => {
      expect(() => createRoomSchema.parse({ playerName: "   " })).toThrow("Player name is required");
    });

    it("trims leading and trailing whitespace from playerName", () => {
      const result = createRoomSchema.parse({ playerName: "  Alice  " });

      expect(result.playerName).toBe("Alice");
    });
  });

  describe("joinRoomSchema", () => {
    it("rejects empty playerName", () => {
      expect(() => joinRoomSchema.parse({ playerName: "" })).toThrow("Player name is required");
    });

    it("rejects whitespace-only playerName", () => {
      expect(() => joinRoomSchema.parse({ playerName: "   " })).toThrow("Player name is required");
    });

    it("trims leading and trailing whitespace from playerName", () => {
      const result = joinRoomSchema.parse({ playerName: "  Bob  " });

      expect(result.playerName).toBe("Bob");
    });
  });

  it("roomCodeParamsSchema rejects missing code", () => {
    expect(() => roomCodeParamsSchema.parse({})).toThrow();
  });
});
