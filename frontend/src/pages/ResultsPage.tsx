import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { GuessHistory } from "../components/GuessHistory";
import { PageHeader } from "../components/PageHeader";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { useRoomState, useRoomStore } from "../state/roomStore";

const POLL_INTERVAL_MS = 2000;

export function ResultsPage() {
  const navigate = useNavigate();
  const { room, participantId } = useRoomState();
  const store = useRoomStore();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room]);

  useEffect(() => {
    if (room?.status === "lobby") {
      navigate("/lobby", { replace: true });
    }
  }, [room?.status, navigate]);

  useEffect(() => {
    if (!room) {
      return;
    }

    async function poll() {
      try {
        await store.fetchRoom();
        store.setPollError(null);
      } catch (caughtError) {
        store.setPollError(caughtError instanceof Error ? caughtError.message : "Unable to refresh room");
      }
    }

    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current !== null) {
        clearInterval(pollRef.current);
      }
    };
  }, [room, store]);

  const handleRestart = useCallback(async () => {
    try {
      await store.restartGame();
    } catch (caughtError) {
      // error is set by roomStore.withLoading
    }
  }, [store]);

  if (!room) {
    return null;
  }

  return (
    <section className="panel results-page">
      <PageHeader
        kicker="Round Complete"
        title="Results"
        description="Here's how the round went."
      />
      <RoomCodeBadge code={room.code} />

      <Card title="Secret Word">
        <p className="secret-word secret-word--revealed">{room.secretWord ?? "—"}</p>
      </Card>

      <div className="results-page__columns">
        <Scoreboard />
        <GuessHistory />
      </div>

      <div className="button-row button-row--spread">
        <span />
        {room.isHost ? (
          <button className="button button--primary" onClick={handleRestart}>
            Restart Game
          </button>
        ) : (
          <p className="status-line" style={{ opacity: 0.6 }}>Waiting for host to start next game...</p>
        )}
      </div>
    </section>
  );
}
