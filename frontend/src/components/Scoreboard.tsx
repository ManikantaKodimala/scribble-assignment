import { useRoomState } from "../state/roomStore";
import { Card } from "./Card";

export function Scoreboard() {
  const { room } = useRoomState();

  const scores = room?.scores ?? {};
  const participants = room?.participants ?? [];
  const entries = participants
    .map((p) => ({ name: p.name, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  return (
    <Card title="Scoreboard">
      {entries.length === 0 ? (
        <div className="placeholder-block" style={{ backgroundColor: '#f9fafb' }}>
          <div className="placeholder-row">
            <span>Waiting for players...</span>
            <strong>0</strong>
          </div>
        </div>
      ) : (
        <ol className="scoreboard-list">
          {entries.map((entry) => (
            <li key={entry.name} className="scoreboard-list__item">
              <span className="scoreboard-list__name">{entry.name}</span>
              <strong className="scoreboard-list__score">{entry.score}</strong>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
