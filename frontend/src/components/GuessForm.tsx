import { useState } from "react";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function GuessForm() {
  const [guessText, setGuessText] = useState("");
  const { guessResult, roundComplete } = useRoomState();
  const store = useRoomStore();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = guessText.trim();

    if (!trimmed) {
      return;
    }

    try {
      await store.submitGuess(trimmed);
      setGuessText("");
    } catch {
      // error is set in store state
    }
  }

  const isSolved = guessResult?.correct === true;
  const isDisabled = isSolved || roundComplete;

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="form__field">
        <input
          className="form__input"
          value={guessText}
          onChange={(event) => setGuessText(event.target.value)}
          placeholder="Type your guess here..."
          disabled={isDisabled}
        />
      </label>
      {guessResult && (
        <div className={`guess-feedback ${guessResult.correct ? "guess-feedback--correct" : "guess-feedback--incorrect"}`}>
          {guessResult.correct ? "Correct!" : "Incorrect"}
        </div>
      )}
      <div className="button-row button-row--compact">
        <button className="button button--primary" type="submit" disabled={isDisabled}>
          Submit Guess
        </button>
      </div>
    </form>
  );
}
