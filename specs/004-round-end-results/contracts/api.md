# API Contracts

## POST /api/rooms/:code/restart

Restart the game — returns all players to lobby, clears round state, preserves participants.

### Request
```
POST /api/rooms/:code/restart
Content-Type: application/json

{
  "participantId": "uuid-string"
}
```

### Success Response (200)
```json
{
  "room": {
    "code": "A3X9",
    "status": "lobby",
    "participants": [
      { "id": "...", "name": "Alice", "isHost": true, "joinedAt": "..." },
      { "id": "...", "name": "Bob", "isHost": false, "joinedAt": "..." }
    ],
    "hostId": "...",
    "isHost": true,
    "drawerId": null,
    "secretWord": undefined,
    "guesses": [],
    "scores": {},
    "roundComplete": false,
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

### Error Responses
| Status | Condition |
|---|---|
| 400 | Not the host |
| 404 | Room not found |

---

## GET /api/rooms/:code (Updated Behavior No-Break)

No endpoint changes. The existing polling endpoint now includes `secretWord` for all viewers when `roundComplete` is true.

### Response (when round is complete)
```json
{
  "room": {
    ...
    "status": "playing",
    "roundComplete": true,
    "secretWord": "castle",
    "guesses": [
      { "id": "...", "participantName": "Bob", "text": "house", "isCorrect": false, ... },
      { "id": "...", "participantName": "Bob", "text": "castle", "isCorrect": true, ... }
    ],
    "scores": { "alice-uuid": 0, "bob-uuid": 100 },
    ...
  }
}
```

**Key change**: `secretWord` is now included for ALL viewers (not just the drawer) when `roundComplete === true`. This is backwards compatible — clients already handle `secretWord` as optional.
