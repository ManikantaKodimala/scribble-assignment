# Quickstart: Guess Submission & Scoring

Implementation order for this feature.

## Prerequisites

- Feature 002 (First Round Start) fully implemented
- Backend and frontend dev servers running (`npm run dev` in each)
- Two browser tabs for testing

## Implementation Sequence

### 1. Backend: Add Guess and Score types

- Add `Guess` interface to `backend/src/models/game.ts`
- Add `guesses` and `solvedParticipantIds` fields to `Round`
- Add `guesses` and `scores` fields to `RoomSnapshot`

### 2. Backend: Add guess endpoint

- Add `POST /rooms/:code/guess` route in `backend/src/api/rooms.ts`
- Create `guessBodySchema` in `backend/src/api/schemas.ts` — validate `participantId` and `guess` string

### 3. Backend: Implement guess processing

- Add `submitGuess(roomCode, participantId, guessText)` to `roomStore.ts`:
  - Trim guess, reject empty
  - Verify round is active
  - Verify submitter is a guesser (not drawer)
  - Case-insensitive comparison
  - Award 100 points on first correct guess
  - Add to guess history
  - Check if all guessers solved → end round
  - Return `GuessResult`

### 4. Backend: Update RoomSnapshot

- Add `guesses` array (current round guesses) to `toRoomSnapshot()`
- Add `scores` map to `toRoomSnapshot()`
- Include `roundComplete` flag when applicable

### 5. Frontend: Add API methods

- Add `submitGuess(code, participantId, guess)` to `frontend/src/services/api.ts`
- Ensure `fetchRoom` response includes `guesses` and `scores`

### 6. Frontend: Update room store

- Add `scores`, `guesses`, `guessResult`, `roundComplete` to `RoomState`
- Add `submitGuess` action to `RoomStore`
- Ensure polling refreshes guess history

### 7. Frontend: Build GuessHistory component

- Create `GuessHistory.tsx` component showing ordered list of guesses
- Display guesser name, guess text, correct/incorrect marker
- Show scores alongside each guesser

### 8. Frontend: Update GamePage

- Show `GuessHistory` in drawer sidebar and guesser sidebar
- Show scoreboard with current scores
- Show "Round Complete" state when `roundComplete` is true

### 9. Verification

- Guesser submits a correct guess → sees "Correct!" + score increases by 100
- Guesser submits an incorrect guess → sees "Incorrect" + score unchanged
- Guesser submits empty guess → error message shown
- Network failure during guess → inline error below input, form stays enabled
- Poll failure → subtle error banner shown, polling continues
- All players see guess history update via polling
- Drawer sees all guesses with submitter names
- When all guessers guess correctly → round ends, game waits
- Same guess submitted twice by same player → only first scores
