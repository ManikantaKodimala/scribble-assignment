import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { LobbyStatus } from "../components/LobbyStatus";
import { PageHeader } from "../components/PageHeader";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { useRoomState, useRoomStore } from "../state/roomStore";

const POLL_INTERVAL_MS = 2000;

export function LobbyPage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, error, isLoading, pollError } = useRoomState();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatingRef = useRef(false);

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room]);

  useEffect(() => {
    if (room?.status === "playing" && !navigatingRef.current) {
      navigatingRef.current = true;
      navigate("/game", { replace: true });
    }
  }, [room?.status, navigate]);

  useEffect(() => {
    if (!room) {
      return;
    }

    async function poll() {
      try {
        await roomStore.fetchRoom();
        roomStore.setPollError(null);
      } catch (caughtError) {
        roomStore.setPollError(caughtError instanceof Error ? caughtError.message : "Unable to refresh room");
      }
    }

    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current !== null) {
        clearInterval(pollRef.current);
      }
    };
  }, [room, roomStore]);

  const handleStartGame = useCallback(async () => {
    try {
      await roomStore.startGame();
    } catch (caughtError) {
      // error is set by roomStore.withLoading
    }
  }, [roomStore]);

  if (!room) {
    return null;
  }

  return (
    <section className="panel placeholder-page">
      <div className="lobby-header">
        <PageHeader
          kicker="Waiting for players"
          title="Lobby"
          description="Share the room code with friends so they can join your game."
        />
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="summary-grid">
        <Card title="Participants">
          {room.participants.length === 0 ? (
            <p>No participants are connected to this room yet.</p>
          ) : (
            <ul className="player-list">
              {room.participants.map((participant) => (
                <li key={participant.id}>
                  <span>{participant.name}</span>
                  {participant.isHost ? <span className="badge badge--host">Host</span> : null}
                  <span className="player-list__meta">joined</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Status">
          <p className="status-line" style={{ backgroundColor: isLoading ? '#fef3c7' : '#e0e7ff', color: isLoading ? '#b45309' : '#3730a3' }}>
            {isLoading ? "Refreshing players..." : "Ready to play"}
          </p>
          <p style={{ marginTop: '8px' }}>{error ?? "Waiting for the host to start the game."}</p>
        </Card>
      </div>

      <LobbyStatus pollError={pollError} />

      <div className="button-row button-row--spread">
        <span />
        {room.isHost ? (
          <button className="button button--primary" disabled={isLoading || room.participants.length < 2} onClick={handleStartGame}>
            {isLoading ? "Starting..." : room.participants.length < 2 ? "Waiting for players..." : "Start Game"}
          </button>
        ) : (
          <p className="status-line" style={{ opacity: 0.6 }}>Waiting for host to start the game...</p>
        )}
      </div>
    </section>
  );
}
