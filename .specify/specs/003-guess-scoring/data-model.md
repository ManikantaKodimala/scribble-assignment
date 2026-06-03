# Data Model: Guess Submission & Scoring

## Entities

### Guess

A text submission made by a guesser during a round.

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier for this guess |
| participantId | string | The guesser who submitted this guess |
| participantName | string | Display name of the guesser (denormalized for history display) |
| text | string | The submitted guess text after trimming |
| isCorrect | boolean | Whether this guess matches the secret word |
| timestamp | string (ISO 8601) | When the guess was submitted |
| roundNumber | number | Which round this guess belongs to |

**Relationships**:
- A Guess belongs to a Participant (via `participantId`)
- A Guess belongs to a Round (via `roundNumber`)

### Score

Each participant's cumulative points in the game.

| Field | Type | Description |
|-------|------|-------------|
| participantId | string | The participant |
| total | number | Total points across all rounds |
| roundScores | Record<number, number> | Points earned per round number |

**Relationships**:
- A Score belongs to a Participant
- Score is reset when a new game starts

### Guess History

An ordered list of guesses for the current round, part of the Room / Round state.

| Field | Type | Description |
|-------|------|-------------|
| guesses | Guess[] | All guesses in submission order |

**Rules**:
- Guesses are ordered by submission time (oldest first)
- Cleared at the start of each new round
- Visible to all participants (drawer and guessers)
- Both correct and incorrect guesses appear; correct guesses are marked

### Round Extensions

The existing `Round` model gains:

| Field | Type | Description |
|-------|------|-------------|
| guesses | Guess[] | All guesses submitted this round |
| solvedParticipantIds | string[] | Participants who have guessed correctly this round |
| status | "in_progress" \| "completed" | Whether the round is active or finished |

### Room Extensions

The existing `Room` model gains:

| Field | Type | Description |
|-------|------|-------------|
| scores | Record<string, number> | Map of participantId → cumulative score |

## State Transitions

### Guess Submission Flow

```
guesser submits guess text
    → backend trims whitespace
    → if empty: reject with error
    → compare (lowercased) against secret word (lowercased)
    → if match:
        → if guesser not already in solvedParticipantIds:
            → mark guesser as solved
            → award 100 points
            → if all guessers now solved: end round
    → add guess to round.guesses
    → return GuessResult { correct: boolean, ... }
```

### Round End Trigger

```
last guesser guesses correctly (all guessers solved)
    → round.status = "completed"
    → scores finalized for this round
    → game waits; host/drawer must explicitly start next round
```

## Validation Rules

| Rule | Source |
|------|--------|
| Guess text MUST be trimmed (leading/trailing whitespace removed) | FR-001 |
| Guess comparison MUST be case-insensitive | FR-002 |
| Empty/whitespace-only guesses MUST be rejected | FR-003 |
| First correct guess per player per round scores 100 points | FR-005, FR-007 |
| Incorrect guesses MUST NOT award points | FR-006 |
| Guesses submitted after round ends MUST be rejected | FR-012 |
