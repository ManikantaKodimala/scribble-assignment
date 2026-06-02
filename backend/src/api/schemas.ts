import { z } from "zod";

export const createRoomSchema = z.object({
  playerName: z.string().trim().min(1, "Player name is required").optional()
});

export const joinRoomSchema = z.object({
  playerName: z.string().trim().min(1, "Player name is required").optional()
});

export const roomCodeParamsSchema = z.object({
  code: z.string().trim().min(1, "Room code is required")
});

export const roomViewerQuerySchema = z.object({
  participantId: z.string().optional()
});

export const startGameBodySchema = z.object({
  participantId: z.string().min(1, "Participant ID is required")
});

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
