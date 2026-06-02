import { randomUUID } from "node:crypto";
import type { Participant, Room, RoomSnapshot } from "../models/game.js";
import { STARTER_ROLES, STARTER_WORDS } from "../seed/starterData.js";

const rooms = new Map<string, Room>();

function now() {
  return new Date().toISOString();
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateUniqueCode() {
  let code = generateCode();

  while (rooms.has(code)) {
    code = generateCode();
  }

  return code;
}

function displayName(name?: string) {
  const trimmed = name?.trim() || "";
  if (!trimmed) {
    throw new Error("Player name is required");
  }
  return trimmed;
}

function createParticipant(name?: string, isHost = false): Participant {
  return {
    id: randomUUID(),
    name: displayName(name),
    isHost,
    joinedAt: now()
  };
}

function cloneRoom(room: Room) {
  return structuredClone(room);
}

export function listWords() {
  return [...STARTER_WORDS];
}

export function createRoom(playerName?: string) {
  const participant = createParticipant(playerName, true);
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    participants: [participant],
    hostId: participant.id,
    currentRound: null,
    createdAt: now(),
    updatedAt: now()
  };

  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function joinRoom(code: string, playerName?: string) {
  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  const participant = createParticipant(playerName, false);
  room.participants.push(participant);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function getRoom(code: string) {
  const room = rooms.get(code);
  return room ? cloneRoom(room) : null;
}

export function saveRoom(room: Room) {
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));
  return getRoom(room.code);
}

export function selectWord(code: string, roundNumber: number): string {
  const sum = code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = (sum + roundNumber - 1) % STARTER_WORDS.length;
  return STARTER_WORDS[index];
}

export function startGame(code: string, participantId: string): Room | null {
  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  if (room.hostId !== participantId) {
    throw new Error("Only the host can start the game");
  }

  if (room.status !== "lobby") {
    throw new Error("Game has already started");
  }

  if (room.participants.length < 2) {
    throw new Error("At least 2 participants are required to start the game");
  }

  room.status = "playing";
  room.currentRound = {
    number: 1,
    drawerId: room.hostId,
    word: selectWord(room.code, 1)
  };
  room.updatedAt = now();

  return cloneRoom(room);
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  const drawerId = room.currentRound?.drawerId ?? null;
  const secretWord = room.currentRound && viewerParticipantId === room.currentRound.drawerId
    ? room.currentRound.word
    : undefined;

  return {
    code: room.code,
    status: room.status,
    participants: room.participants.map((participant) => ({ ...participant })),
    hostId: room.hostId,
    isHost: viewerParticipantId === room.hostId,
    drawerId,
    secretWord,
    availableWords: listWords(),
    roles: [...STARTER_ROLES]
  };
}
