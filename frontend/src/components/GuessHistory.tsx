import { useRoomState } from "../state/roomStore";
import { Card } from "./Card";

export function GuessHistory() {
  const { room, participantId } = useRoomState();

  if (!room) {
    return null;
  }

  return (
    <Card title="Guess History">
      {room.guesses.length === 0 ? (
        <div className="placeholder-block">
          <p className="placeholder-text">No guesses yet.</p>
        </div>
      ) : (
        <ol className="guess-history">
          {room.guesses.map((guess) => (
            <li
              key={guess.id}
              className={`guess-item ${guess.isCorrect ? "guess-item--correct" : ""}`}
            >
              <span className="guess-item__author">{guess.participantName}</span>
              <span className="guess-item__text">{guess.text}</span>
              {guess.isCorrect && <span className="guess-item__mark">Correct!</span>}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
