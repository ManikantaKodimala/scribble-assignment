import { randomUUID } from "node:crypto";
import type { Guess, GuessResult, Participant, Room, RoomSnapshot } from "../models/game.js";
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
    scores: {},
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

  room.scores = Object.fromEntries(room.participants.map((p) => [p.id, 0]));
  room.status = "playing";
  room.currentRound = {
    number: 1,
    drawerId: room.hostId,
    word: selectWord(room.code, 1),
    status: "in_progress",
    guesses: [],
    solvedParticipantIds: []
  };
  room.updatedAt = now();

  return cloneRoom(room);
}

export function submitGuess(
  code: string,
  participantId: string,
  text: string
): GuessResult | { error: string } {
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found" };
  }

  if (room.status !== "playing" || !room.currentRound) {
    return { error: "No active round" };
  }

  const round = room.currentRound;

  if (round.status === "completed") {
    return { error: "Round has already ended" };
  }

  if (round.drawerId === participantId) {
    return { error: "Drawer cannot submit guesses" };
  }

  const participant = room.participants.find((p) => p.id === participantId);
  if (!participant) {
    return { error: "Participant not found" };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { error: "Guess cannot be empty" };
  }

  const isCorrect = trimmed.toLowerCase() === round.word.toLowerCase();
  const alreadySolved = round.solvedParticipantIds.includes(participantId);

  if (isCorrect && !alreadySolved) {
    room.scores[participantId] = (room.scores[participantId] ?? 0) + 100;
    round.solvedParticipantIds.push(participantId);
  }

  const guess: Guess = {
    id: randomUUID(),
    participantId,
    participantName: participant.name,
    text: trimmed,
    isCorrect,
    timestamp: now(),
    roundNumber: round.number
  };

  round.guesses.push(guess);

  const guessers = room.participants.filter((p) => p.id !== round.drawerId);
  const allSolved = guessers.every((g) => round.solvedParticipantIds.includes(g.id));

  if (allSolved) {
    round.status = "completed";
  }

  room.updatedAt = now();
  rooms.set(room.code, room);

  const result: GuessResult = {
    correct: isCorrect,
    roundComplete: allSolved,
    guess,
    scores: { ...room.scores }
  };

  return result;
}

export function clearCanvas(
  code: string,
  participantId: string
): { ok: true } | { error: string } {
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found" };
  }

  if (!room.currentRound || room.currentRound.drawerId !== participantId) {
    return { error: "Only the drawer can clear the canvas" };
  }

  return { ok: true };
}

export function restartGame(code: string, participantId: string): Room | null {
  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  if (room.hostId !== participantId) {
    throw new Error("Only the host can restart the game");
  }

  room.scores = {};
  room.currentRound = null;
  room.status = "lobby";
  room.updatedAt = now();

  return cloneRoom(room);
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  const drawerId = room.currentRound?.drawerId ?? null;
  const roundComplete = room.currentRound?.status === "completed";
  const secretWord = room.currentRound && (
    viewerParticipantId === room.currentRound.drawerId || roundComplete
  )
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
    guesses: room.currentRound?.guesses ?? [],
    scores: { ...room.scores },
    roundComplete,
    availableWords: listWords(),
    roles: [...STARTER_ROLES]
  };
}
