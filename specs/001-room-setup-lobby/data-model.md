# Data Model: Room Setup & Lobby

## Entities

### Room

Represents a game session. Created when a player uses the create-room flow.

| Field | Type | Description |
|-------|------|-------------|
| `code` | String (4 chars) | Unique room identifier. Uppercase alphanumeric (no 0/O, 1/I/L). |
| `status` | Enum: `"lobby"` or `"playing"` | Current room lifecycle state. |
| `participants` | Participant[] | List of players currently in the room. |
| `hostId` | String (UUID) | Participant ID of the room creator. |
| `createdAt` | String (ISO 8601) | Timestamp of room creation. |
| `updatedAt` | String (ISO 8601) | Timestamp of last room mutation. |

**Validation rules:**
- `code` MUST be unique across all rooms
- `code` MUST be exactly 4 characters, uppercase, from the set [A-Z2-9] excluding [0, O, 1, I, L]
- `status` MUST transition `"lobby"` → `"playing"` (one-way for this feature)
- `participants` MUST contain at least 1 entry at all times
- `hostId` MUST match a participant ID in `participants`

### Participant

Represents a single player in a room.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Unique participant identifier. |
| `name` | String | Display name. Defaults to "Player" if empty. Not required to be unique. |
| `isHost` | Boolean | Whether this participant is the room host. |
| `joinedAt` | String (ISO 8601) | Timestamp of when the participant joined. |

**Validation rules:**
- `id` MUST be globally unique
- `name` MUST be a non-null string (may be empty, which displays as "Player")
- Exactly one participant in a room MUST have `isHost = true`

## State Transitions

```
                    ┌──────────┐
                    │  lobby   │
                    └────┬─────┘
                         │ host clicks "Start Game"
                         │ and participants.length >= 2
                         ▼
                    ┌──────────┐
                    │ playing  │
                    └──────────┘
```

## Backend State Shape (in-memory)

```typescript
interface Room {
  code: string;
  status: "lobby" | "playing";
  participants: Participant[];
  hostId: string;
  createdAt: string;
  updatedAt: string;
}

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
}
```

## Frontend State Shape (React store)

```typescript
interface RoomState {
  room: RoomSnapshot | null;
  participantId: string | null;
  error: string | null;
  isLoading: boolean;
  pollError: string | null;  // added: tracks polling failure state
}
```
