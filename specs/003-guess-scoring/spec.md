# Feature Specification: Guess Submission & Scoring

**Created**: 2026-06-02

**Status**: Draft

**Input**: Given a round is active with a drawer and guessers (all scores start at 0), When the drawer draws/clears the canvas and guessers submit their guesses, Then the drawing is visible on the drawer's screen; guesses are trimmed, case-insensitively compared, and empty ones rejected; the guess history is synced to all players via polling; correct guesses score 100 (incorrect add 0).

## Clarifications

### Session 2026-06-02

- Q: Round lifecycle when all guessers guess correctly? → A: Round auto-ends when all guessers have guessed correctly (or a time limit is reached, whichever comes first).
- Q: What feedback does a guesser see after a correct guess? → A: "Correct!" notice displayed and guesser marked as solved; word is not explicitly re-revealed.
- Q: Is guess history retained per-round or accumulated across game? → A: Per-round only — history resets when a new round begins.
- Q: Should incorrect guesses appear in guess history? → A: Yes — all guesses (correct and incorrect) appear; correct ones are visually marked.
- Q: What happens when all guessers guess correctly — auto-advance or wait? → A: Round ends and game waits. Host or drawer must explicitly trigger the next round.
- Q: What UX should be shown on guess submission or polling failure? → A: Inline error below the guess input on submission failure; form stays enabled for retry. Poll failures show a subtle error banner and keep polling active.
- Q: What is explicitly out of scope for this feature? → A: Multi-round orchestration and game-over state management. This feature covers a single round's guess submission, scoring, and history sync only.
- Q: Should there be a rate limit on guess submissions? → A: No limit — with in-memory state and ≤10 players, rapid guesses are handled gracefully.

## User Scenarios & Testing

### User Story 1 - Guesser Submits a Guess (Priority: P1)

The core interaction of the game: during an active round, a guesser types a word and submits it. The system processes the guess (trims whitespace, ignores empty, compares case-insensitively against the secret word) and tells the guesser whether they were correct.

**Why this priority**: Without the submit-and-compare mechanic, the game cannot progress. This is the fundamental interaction loop.

**Independent Test**: A guesser can type a guess, submit it, and see a correct/incorrect result immediately. The guesser's score updates on a correct answer. On network failure, an inline error is shown and the form remains enabled for retry.

**Acceptance Scenarios**:

1. **Given** a round is active and I am a guesser, **When** I submit a guess that matches the secret word (case-insensitive, ignoring leading/trailing whitespace), **Then** I see a "Correct!" notice, my score increases by 100, and I am marked as having solved the round.

2. **Given** a round is active and I am a guesser, **When** I submit a guess that does not match the secret word, **Then** I am told my guess is incorrect and my score stays the same.

3. **Given** a round is active and I am a guesser, **When** I submit an empty or whitespace-only guess, **Then** my guess is rejected with an error message and my score is not affected.

4. **Given** a round is active and I am a guesser who has already guessed correctly, **When** I submit another guess, **Then** my guess is accepted but not scored (already solved this round).

---

### User Story 2 - Drawer Sees Canvas and Guesses (Priority: P1)

The drawer needs to see their own drawing canvas and the incoming guesses from all players to interact with the round.

**Why this priority**: The drawer must understand what guessers are thinking to respond to the drawing. Without this, the drawer is blind to the game state.

**Independent Test**: The drawer sees the canvas with their drawing and a live-updating list of guesses submitted by all guessers during the round.

**Acceptance Scenarios**:

1. **Given** a round is active and I am the drawer, **When** I use the drawing canvas, **Then** my drawing appears on my screen.

2. **Given** a round is active and I am the drawer, **When** I clear the canvas, **Then** the canvas is emptied.

3. **Given** a round is active and I am the drawer, **When** guessers submit guesses, **Then** I can see all guesses (with submitter names) in a shared guess history.

---

### User Story 3 - Guess History Synced to All Players (Priority: P2)

All players (drawer and guessers) see the same guess history for the current round, updated regularly via polling.

**Why this priority**: Without shared visibility, guessers cannot learn from others' attempts and the drawer cannot gauge progress. This sync is essential for the social game experience.

**Independent Test**: Two browser tabs (one drawer, one guesser) show the same guess history after a guess is submitted by any guesser within a few seconds.

**Acceptance Scenarios**:

1. **Given** a round is active, **When** any guesser submits a guess, **Then** within a reasonable time all players see the guess appear in the guess history.

2. **Given** a round is active, **When** I am not the submitter of a new guess, **Then** the guess history updates to include guesses from other players.

---

### Edge Cases

- What happens when a guesser submits the same correct guess multiple times in a round? (Only first correct guess should score; guesser stays marked as solved.)
- What does a guesser who has already solved see when other guessers submit guesses? (They see the guess history update like any other player.)
- What happens when all guessers have guessed correctly? (The round ends and the game waits. The host or drawer must explicitly start the next round.)
- What happens when the guess history grows very long? (Consider truncation or scroll behavior.)
- What happens to guesses submitted after the round ends? (They should be rejected.)

## Out of Scope

- Multi-round orchestration (starting the next round, word selection for subsequent rounds, round timer)
- Game-over state management and end-of-game flow
- Drawing canvas implementation (assumed pre-existing; this feature only requires canvas visibility and clearing)

## Requirements

### Functional Requirements

- **FR-001**: The system MUST trim leading and trailing whitespace from submitted guesses before processing.
- **FR-002**: The system MUST compare guesses against the secret word case-insensitively.
- **FR-003**: The system MUST reject empty or whitespace-only guesses with an error message.
- **FR-004**: The system MUST return a correct/incorrect result to the guesser immediately after processing.
- **FR-005**: The system MUST award 100 points to a guesser for their first correct guess in a round.
- **FR-006**: The system MUST NOT award points for incorrect guesses.
- **FR-007**: The system MUST award points only once per guesser per round for the correct word.
- **FR-008**: The system MUST provide a guess history containing all submitted guesses (with submitter name, timestamp, and correct/incorrect status) for the current round.
- **FR-009**: The system MUST update the guess history for all players within a reasonable polling interval.
- **FR-010**: The drawer MUST be able to see the drawing canvas.
- **FR-011**: The drawer MUST be able to clear the drawing canvas.
- **FR-012**: Guesses submitted after a round ends MUST be rejected.

### Key Entities

- **Guess**: A text submission made by a guesser during a round. Attributes: the submitted text (after trimming), the guesser's identity, the round number, a timestamp, and whether it matches the secret word.
- **Score**: Each participant's cumulative points across all rounds in the game. Starts at 0 and increases by 100 for each first-correct guess in a round.
- **Guess History**: An ordered list of guesses for the current round only, visible to all participants, showing who guessed what and whether it was correct. Cleared at the start of each new round.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A guesser can submit a guess and see a correct/incorrect result or inline error within 2 seconds.
- **SC-002**: All players see new guesses appear in the shared guess history within 3 seconds of submission.
- **SC-003**: Incorrect guesses do not change a player's score.
- **SC-004**: A correct guess increases the guesser's score by exactly 100 points.
- **SC-005**: Empty and whitespace-only guesses are rejected with an error message without affecting score.
- **SC-006**: The same correct word guessed twice by the same player in one round does not award additional points.
- **SC-007**: The drawer can draw and see their drawing reflected on their screen.

## Assumptions

- A round has exactly one secret word.
- Guessers can submit multiple guesses during a round.
- Once a guesser guesses correctly, they continue to see the round progress but are noted as having solved it.
- The round ends when all guessers have guessed correctly (or a time limit is reached, defined elsewhere). The final guess that results in all guessers having solved it triggers round end immediately; the game then waits for the host or drawer to start the next round.
- Scores are cumulative across all rounds in a game session.
- Only the first correct guess per player per round scores points; subsequent correct guesses by the same player do not add score.
- Existing polling infrastructure is used for guess history sync.
- The drawing canvas already has drawing/clearing capabilities; this spec only ensures visibility.
- No rate limiting on guess submissions is needed at the supported scale (≤10 participants).
