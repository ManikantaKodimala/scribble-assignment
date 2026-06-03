import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { GuessForm } from "../components/GuessForm";
import { GuessHistory } from "../components/GuessHistory";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { useRoomState, useRoomStore } from "../state/roomStore";

const POLL_INTERVAL_MS = 2000;

export function GamePage() {
  const navigate = useNavigate();
  const { room, participantId, roundComplete } = useRoomState();
  const store = useRoomStore();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatingRef = useRef(false);

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room]);

  useEffect(() => {
    if (roundComplete && !navigatingRef.current) {
      navigatingRef.current = true;
      navigate("/results", { replace: true });
    }
  }, [roundComplete, navigate]);

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

  const handleClearCanvas = useCallback(async () => {
    await store.clearCanvas();
  }, [store]);

  if (!room) {
    return null;
  }

  const viewer = room.participants.find((participant) => participant.id === participantId) ?? null;
  const isDrawer = participantId === room.drawerId;
  const drawer = room.participants.find((participant) => participant.id === room.drawerId) ?? null;
  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">Round 1</span>
          <h1 className="game-page__title">{isDrawer ? "Draw the Word!" : "Guess the Word!"}</h1>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      {roundComplete ? (
        <div className="round-complete-banner">
          <h2 className="round-complete-banner__title">Round Complete!</h2>
        </div>
      ) : (
        isDrawer && room.secretWord ? (
          <div className="drawer-banner">
            <Card title="Your Word">
              <p className="secret-word">{room.secretWord}</p>
            </Card>
          </div>
        ) : (
          <div className="drawer-indicator drawer-indicator--guesser">
            <p>{drawer ? `${drawer.name} is drawing` : "Waiting for drawer..."}</p>
          </div>
        )
      )}

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Scoreboard />
          <GuessHistory />
        </aside>

        <div className="game-page__main">
          <Card title="Canvas">
            <div className="canvas-placeholder" style={{ minHeight: '500px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
              Waiting for drawing...
            </div>
          </Card>
          {isDrawer && (
            <div className="button-row" style={{ marginTop: '0.5rem' }}>
              <button className="button button--secondary" onClick={handleClearCanvas}>
                Clear Canvas
              </button>
            </div>
          )}
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{isDrawer ? "Drawing" : "Playing"}</dd>
              </div>
            </dl>
          </Card>

          {!isDrawer ? (
            <Card title="Your Guess">
              <GuessForm />
            </Card>
          ) : null}
        </aside>
      </div>

      <div className="button-row">
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
      </div>
    </section>
  );
}
