# API Contracts: First Round Start

Base URL: `http://localhost:3001`

All requests and responses use `Content-Type: application/json`.

Changes from the base contracts (feature 001: Room Setup & Lobby) are marked with ✦.

---

## POST /rooms ✦

Create a new room. `playerName` is now validated: empty or whitespace-only names are rejected.

**Request body:**

```json
{
  "playerName": "Alice"
}
```

- `playerName`: required non-empty string after trimming. Rejects blank/whitespace-only.

**Response (201):**

```json
{
  "participantId": "uuid-string",
  "room": {
    "code": "XK4F",
    "status": "lobby",
    "participants": [
      {
        "id": "uuid-string",
        "name": "Alice",
        "isHost": true,
        "joinedAt": "2026-06-01T00:00:00.000Z"
      }
    ],
    "hostId": "uuid-string",
    "drawerId": null,
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

✦ `drawerId` is `null` until the game starts.

**Errors:**

| Status | Condition |
|--------|-----------|
| 400 | Invalid request body — empty/whitespace-only player name |

---

## POST /rooms/:code/join ✦

Join an existing room by its code. `playerName` is now validated.

**Request body:**

```json
{
  "playerName": "Bob"
}
```

- `playerName`: required non-empty string after trimming. Rejects blank/whitespace-only.

**Response (200):**

```json
{
  "participantId": "joiner-uuid",
  "room": {
    "code": "XK4F",
    "status": "lobby",
    "participants": [
      { "id": "host-uuid", "name": "Alice", "isHost": true, "joinedAt": "..." },
      { "id": "joiner-uuid", "name": "Bob", "isHost": false, "joinedAt": "..." }
    ],
    "hostId": "host-uuid",
    "drawerId": null,
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Errors:**

| Status | Condition |
|--------|-----------|
| 400 | Invalid request body — empty/whitespace-only player name |
| 404 | Room code does not exist |

---

## GET /rooms/:code?participantId=<id> ✦

Poll for the current room snapshot. Now includes `drawerId` and (for the drawer only) `secretWord`.

**Response (200) — when room is in lobby:**

```json
{
  "room": {
    "code": "XK4F",
    "status": "lobby",
    "participants": [ ... ],
    "hostId": "host-uuid",
    "drawerId": null,
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Response (200) — when room is playing, viewer is the drawer:**

```json
{
  "room": {
    "code": "XK4F",
    "status": "playing",
    "participants": [ ... ],
    "hostId": "host-uuid",
    "drawerId": "host-uuid",
    "secretWord": "pizza",
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

✦ `secretWord` field included only when the viewer's `participantId` matches `drawerId`.

**Response (200) — when room is playing, viewer is a guesser:**

```json
{
  "room": {
    "code": "XK4F",
    "status": "playing",
    "participants": [ ... ],
    "hostId": "host-uuid",
    "drawerId": "host-uuid",
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

✦ `secretWord` is omitted entirely for non-drawer viewers.

**Errors:**

| Status | Condition |
|--------|-----------|
| 404 | Room code does not exist |

---

## POST /rooms/:code/start ✦

Start the game. In addition to existing logic, this now creates round 1 and assigns the host as drawer.

**Request body:**

```json
{
  "participantId": "host-uuid"
}
```

**Response (200):**

```json
{
  "room": {
    "code": "XK4F",
    "status": "playing",
    "participants": [ ... ],
    "hostId": "host-uuid",
    "drawerId": "host-uuid",
    "secretWord": "pizza",
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

✦ `drawerId` is now set to the host's participant ID. `secretWord` is included for the host (who is the drawer in round 1).

**Errors:**

| Status | Condition |
|--------|-----------|
| 400 | Invalid request body |
| 403 | Caller is not the host |
| 403 | Fewer than 2 participants in the room |
| 404 | Room code does not exist |
