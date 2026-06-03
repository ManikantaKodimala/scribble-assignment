# API Contracts: Guess Submission & Scoring

Base URL: `http://localhost:3001`

All requests and responses use `Content-Type: application/json`.

Changes from the base contracts (feature 002: First Round Start) are marked with ✦.

---

## POST /rooms/:code/guess ✦

Submit a guess for the current round. Only guessers (not the drawer) can submit guesses. Guesses submitted after the round ends are rejected.

**Request body:**

```json
{
  "participantId": "uuid-string",
  "guess": "rocket"
}
```

- `participantId`: required, must be a valid participant in the room
- `guess`: required non-empty string (after trimming); whitespace-only rejected

**Response (200) — incorrect guess:**

```json
{
  "correct": false,
  "guess": {
    "id": "uuid-string",
    "participantId": "uuid-string",
    "participantName": "Alice",
    "text": "rocket",
    "isCorrect": false,
    "timestamp": "2026-06-02T00:00:00.000Z",
    "roundNumber": 1
  },
  "scores": {
    "uuid-string": 0
  }
}
```

**Response (200) — correct guess (not final solver):**

```json
{
  "correct": true,
  "guess": {
    "id": "uuid-string",
    "participantId": "uuid-string",
    "participantName": "Alice",
    "text": "rocket",
    "isCorrect": true,
    "timestamp": "2026-06-02T00:00:00.000Z",
    "roundNumber": 1
  },
  "scores": {
    "uuid-string": 100
  }
}
```

**Response (200) — correct guess (final solver, round ends):**

```json
{
  "correct": true,
  "roundComplete": true,
  "guess": {
    "id": "uuid-string",
    "participantId": "uuid-string",
    "participantName": "Bob",
    "text": "rocket",
    "isCorrect": true,
    "timestamp": "2026-06-02T00:00:00.000Z",
    "roundNumber": 1
  },
  "scores": {
    "uuid-string": 0,
    "other-uuid": 100
  }
}
```

**Response (400) — empty guess:**

```json
{
  "message": "Guess cannot be empty"
}
```

**Response (400) — round not active:**

```json
{
  "message": "No active round to guess in"
}
```

**Response (403) — drawer cannot guess:**

```json
{
  "message": "The drawer cannot submit guesses"
}
```

---

## GET /rooms/:code ✦

Fetch room state (includes guesses and scores during active rounds).

**Query parameters:**
- `participantId` (optional, string): Identifies the viewer for drawer/guesser differentiation.

**Response (200):**

```json
{
  "room": {
    "code": "XK4F",
    "status": "playing",
    "participants": [...],
    "hostId": "uuid-string",
    "drawerId": "uuid-string",
    "secretWord": "rocket",
    "guesses": [
      {
        "id": "uuid-string",
        "participantId": "uuid-string",
        "participantName": "Bob",
        "text": "castle",
        "isCorrect": false,
        "timestamp": "2026-06-02T00:00:00.000Z",
        "roundNumber": 1
      }
    ],
    "scores": {
      "uuid-string": 0
    },
    "availableWords": [...],
    "roles": [...]
  }
}
```

✦ `guesses` array added — contains all guesses for the current round (empty if no round active).
✦ `scores` map added — participantId → cumulative score.
✦ `secretWord` is only included when `participantId` matches the drawer (existing behavior).

**Response (404):**

```json
{
  "message": "Room not found"
}
```
