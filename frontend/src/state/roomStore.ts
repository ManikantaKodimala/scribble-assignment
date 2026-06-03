import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type PropsWithChildren
} from "react";
import { api, type GuessResult, type RoomSessionResponse, type RoomSnapshot } from "../services/api";

export interface RoomState {
  room: RoomSnapshot | null;
  participantId: string | null;
  error: string | null;
  isLoading: boolean;
  pollError: string | null;
  guessResult: GuessResult | null;
  roundComplete: boolean;
}

type Listener = () => void;

class RoomStore {
  private state: RoomState = {
    room: null,
    participantId: null,
    error: null,
    isLoading: false,
    pollError: null,
    guessResult: null,
    roundComplete: false
  };

  private listeners = new Set<Listener>();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.state;

  private setState(nextState: Partial<RoomState>) {
    this.state = {
      ...this.state,
      ...nextState
    };
    this.listeners.forEach((listener) => listener());
  }

  private async withLoading<T>(operation: () => Promise<T>) {
    this.setState({
      isLoading: true,
      error: null
    });

    try {
      return await operation();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected request failure";
      this.setState({ error: message });
      throw error;
    } finally {
      this.setState({ isLoading: false });
    }
  }

  setRoomSession(response: RoomSessionResponse) {
    this.setState({
      participantId: response.participantId,
      room: response.room,
      error: null
    });
  }

  setRoomSnapshot(room: RoomSnapshot) {
    this.setState({
      room,
      error: null,
      roundComplete: room.roundComplete
    });
  }

  async createRoom(playerName: string) {
    const response = await this.withLoading(() => api.createRoom(playerName));
    this.setRoomSession(response);
    return response;
  }

  async joinRoom(code: string, playerName: string) {
    const response = await this.withLoading(() => api.joinRoom(code, playerName));
    this.setRoomSession(response);
    return response;
  }

  setGuessResult(result: GuessResult | null) {
    this.setState({ guessResult: result });
  }

  setRoundComplete(complete: boolean) {
    this.setState({ roundComplete: complete });
  }

  setPollError(message: string | null) {
    this.setState({ pollError: message });
  }

  async startGame() {
    const { room, participantId } = this.state;

    if (!room || !participantId) {
      throw new Error("No active room session");
    }

    const response = await this.withLoading(() => api.startGame(room.code, participantId));
    this.setRoomSnapshot(response.room);
    return response.room;
  }

  async submitGuess(text: string) {
    const { room, participantId } = this.state;

    if (!room || !participantId) {
      throw new Error("No active room session");
    }

    const response = await this.withLoading(() => api.submitGuess(room.code, participantId, text));
    this.setGuessResult(response.result);

    if (response.result.roundComplete) {
      this.setRoundComplete(true);
    }

    return response.result;
  }

  async restartGame() {
    const { room, participantId } = this.state;

    if (!room || !participantId) {
      throw new Error("No active room session");
    }

    const response = await this.withLoading(() => api.restartGame(room.code, participantId));
    this.setRoomSnapshot(response.room);
    return response.room;
  }

  async clearCanvas() {
    const { room, participantId } = this.state;

    if (!room || !participantId) {
      throw new Error("No active room session");
    }

    await api.clearCanvas(room.code, participantId);
  }

  async fetchRoom() {
    if (!this.state.room) {
      return null;
    }

    const snapshot = await api.fetchRoom(this.state.room.code, this.state.participantId ?? undefined);
    this.setRoomSnapshot(snapshot.room);
    return snapshot.room;
  }
}

const RoomStoreContext = createContext<RoomStore | null>(null);

export function RoomStoreProvider({ children }: PropsWithChildren) {
  const storeRef = useRef<RoomStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = new RoomStore();
  }

  useEffect(() => undefined, []);

  return createElement(RoomStoreContext.Provider, { value: storeRef.current }, children);
}

export function useRoomStore() {
  const store = useContext(RoomStoreContext);

  if (!store) {
    throw new Error("RoomStoreProvider is missing");
  }

  return store;
}

export function useRoomState() {
  const store = useRoomStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
