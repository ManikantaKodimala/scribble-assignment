# API Contracts: Room Setup & Lobby

Base URL: `http://localhost:3001`

All requests and responses use `Content-Type: application/json`.

---

## POST /rooms

Create a new room. The creator is designated as host.

**Request body:**

```json
{
  "playerName": "Alice"
}
```

- `playerName`: optional string. Empty/missing defaults to "Player".

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
    "availableWords": [],
    "roles": []
  }
}
```

**Errors:**

| Status | Condition |
|--------|-----------|
| 400 | Invalid request body (Zod validation error) |

---

## POST /rooms/:code/join

Join an existing room by its code.

**Request body:**

```json
{
  "playerName": "Bob"
}
```

- `playerName`: optional string. Empty/missing defaults to "Player".

**Response (200):**

```json
{
  "participantId": "uuid-string",
  "room": {
    "code": "XK4F",
    "status": "lobby",
    "participants": [
      { "id": "host-uuid", "name": "Alice", "isHost": true, "joinedAt": "..." },
      { "id": "joiner-uuid", "name": "Bob", "isHost": false, "joinedAt": "..." }
    ],
    "hostId": "host-uuid",
    "availableWords": [],
    "roles": []
  }
}
```

**Errors:**

| Status | Condition |
|--------|-----------|
| 400 | Invalid request body (Zod validation error) |
| 404 | Room code does not exist |

---

## GET /rooms/:code?participantId=<id>

Poll for the current room snapshot. Used by the lobby for auto-refresh.

**Query parameters:**

- `participantId`: optional string. Identifies the viewer for per-viewer filtering.

**Response (200):**

```json
{
  "room": {
    "code": "XK4F",
    "status": "lobby",
    "participants": [
      { "id": "...", "name": "Alice", "isHost": true, "joinedAt": "..." },
      { "id": "...", "name": "Bob", "isHost": false, "joinedAt": "..." }
    ],
    "hostId": "host-uuid",
    "availableWords": [],
    "roles": []
  }
}
```

When status is `"playing"`, the frontend auto-navigates to the game screen.

**Errors:**

| Status | Condition |
|--------|-----------|
| 404 | Room code does not exist |

---

## POST /rooms/:code/start

Start the game. Only the host can call this, and only when at least 2 participants are
present.

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
    "participants": [
      { "id": "...", "name": "Alice", "isHost": true, "joinedAt": "..." },
      { "id": "...", "name": "Bob", "isHost": false, "joinedAt": "..." }
    ],
    "hostId": "host-uuid",
    "availableWords": [],
    "roles": []
  }
}
```

**Errors:**

| Status | Condition |
|--------|-----------|
| 400 | Invalid request body |
| 403 | Caller is not the host |
| 403 | Fewer than 2 participants in the room |
| 404 | Room code does not exist |
