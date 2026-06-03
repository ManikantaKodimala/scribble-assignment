export type ParticipantRole = "drawer" | "guesser";

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

export interface RoomSnapshot {
  code: string;
  status: "lobby" | "playing";
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

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/bug";

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({ message: "Request failed" }))) as {
      message?: string;
    };

    throw new Error(errorBody.message ?? "Request failed");
  }

  return (await response.json()) as T;
}

export const api = {
  createRoom(playerName: string) {
    return request<RoomSessionResponse>("/rooms", {
      method: "POST",
      body: JSON.stringify({ playerName })
    });
  },
  joinRoom(code: string, playerName: string) {
    return request<RoomSessionResponse>(`/rooms/${encodeURIComponent(code)}/join`, {
      method: "POST",
      body: JSON.stringify({ playerName })
    });
  },
  fetchRoom(code: string, participantId?: string) {
    const query = participantId ? `?participantId=${encodeURIComponent(participantId)}` : "";
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}${query}`);
  },
  startGame(code: string, participantId: string) {
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}/start`, {
      method: "POST",
      body: JSON.stringify({ participantId })
    });
  },
  submitGuess(code: string, participantId: string, text: string) {
    return request<{ result: GuessResult }>(`/rooms/${encodeURIComponent(code)}/guess`, {
      method: "POST",
      body: JSON.stringify({ participantId, text })
    });
  },
  fetchHistory(code: string, participantId: string, afterId?: string) {
    const query = `?participantId=${encodeURIComponent(participantId)}${afterId ? `&afterId=${encodeURIComponent(afterId)}` : ""}`;
    return request<{ guesses: Guess[] }>(`/rooms/${encodeURIComponent(code)}/history${query}`);
  },
  restartGame(code: string, participantId: string) {
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}/restart`, {
      method: "POST",
      body: JSON.stringify({ participantId })
    });
  },

  clearCanvas(code: string, participantId: string) {
    return request<{ ok: boolean }>(`/rooms/${encodeURIComponent(code)}/clear`, {
      method: "POST",
      body: JSON.stringify({ participantId })
    });
  }
};
