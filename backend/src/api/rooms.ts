import { Router } from "express";
import {
  createRoomSchema,
  guessBodySchema,
  HttpError,
  joinRoomSchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema,
  startGameBodySchema
} from "./schemas.js";
import { clearCanvas, createRoom, getRoom, joinRoom, restartGame, startGame, submitGuess, toRoomSnapshot } from "../services/roomStore.js";

export function createRoomsRouter() {
  const router = Router();

  router.post("/", (request, response, next) => {
    try {
      const { playerName } = createRoomSchema.parse(request.body);
      const result = createRoom(playerName);

      response.status(201).json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/join", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { playerName } = joinRoomSchema.parse(request.body);
      const result = joinRoom(code.toUpperCase(), playerName);

      if (!result) {
        throw new HttpError(404, "Room not found");
      }

      response.json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:code", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const room = getRoom(code.toUpperCase());

      if (!room) {
        throw new HttpError(404, "Room not found");
      }

      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/start", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = startGameBodySchema.parse(request.body);
      const updatedRoom = startGame(code.toUpperCase(), participantId);

      if (!updatedRoom) {
        throw new HttpError(404, "Room not found");
      }

      response.json({
        room: toRoomSnapshot(updatedRoom, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/guess", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId, text } = guessBodySchema.parse(request.body);
      const result = submitGuess(code.toUpperCase(), participantId, text);

      if ("error" in result) {
        throw new HttpError(400, result.error);
      }

      response.json({ result });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/restart", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = startGameBodySchema.parse(request.body);
      const updatedRoom = restartGame(code.toUpperCase(), participantId);

      if (!updatedRoom) {
        throw new HttpError(404, "Room not found");
      }

      response.json({
        room: toRoomSnapshot(updatedRoom, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/clear", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = startGameBodySchema.parse(request.body);
      const result = clearCanvas(code.toUpperCase(), participantId);

      if ("error" in result) {
        throw new HttpError(400, result.error);
      }

      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
