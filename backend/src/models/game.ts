export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "playing";
export type RoundStatus = "in_progress" | "completed";

export interface Guess {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  isCorrect: boolean;
  timestamp: string;
  roundNumber: number;
}

export interface GuessResult {
  correct: boolean;
  roundComplete?: boolean;
  guess: Guess;
  scores: Record<string, number>;
}

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
}

export interface Round {
  number: number;
  drawerId: string;
  word: string;
  status: RoundStatus;
  guesses: Guess[];
  solvedParticipantIds: string[];
}

export interface Room {
  code: string;
  status: RoomStatus;
  participants: Participant[];
  hostId: string;
  currentRound: Round | null;
  scores: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  participants: Participant[];
  hostId: string;
  isHost: boolean;
  drawerId: string | null;
  secretWord?: string;
  guesses: Guess[];
  scores: Record<string, number>;
  roundComplete: boolean;
  availableWords: string[];
  roles: ParticipantRole[];
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
