# Data Model: First Round Start

## New/Modified Entities

### Room (extended)

| Field | Type | Change | Description |
|-------|------|--------|-------------|
| `currentRound` | Round? | **New** | The active round data when status is `"playing"`. `null` when in `"lobby"`. |

### Round (new)

Represents a single drawing round within a game session.

| Field | Type | Description |
|-------|------|-------------|
| `number` | Number | Round number (starts at 1). |
| `drawerId` | String (UUID) | Participant ID of the player drawing this round. |
| `secretWord` | String | The word the drawer must draw. Selected deterministically from the starter list. |
| `status` | Enum: `"in_progress"` or `"completed"` | Current lifecycle state of this round. |

**Validation rules:**
- `number` MUST be positive and unique per room (no duplicate round numbers)
- `drawerId` MUST match a participant ID in the room's participant list
- `secretWord` MUST be one of the words from the starter word list
- `status` MUST transition `"in_progress"` → `"completed"` (one-way)

### RoomSnapshot (extended)

| Field | Type | Change | Description |
|-------|------|--------|-------------|
| `drawerId` | String? | **New** | Participant ID of the current round's drawer. `null` when in lobby. Visible to all participants. |
| `secretWord` | String? | **New** | The current round's secret word. **Only included when the viewer participant is the drawer.** `undefined` for non-drawer viewers and in lobby. |

## State Transitions

```
                    ┌──────────┐
                    │  lobby   │
                    └────┬─────┘
                         │ host clicks "Start Game"
                         │ FR-003: host becomes drawer
                         │ FR-005: word selected deterministically
                         ▼
                    ┌──────────┐
                    │ playing  │
                    │ round 1  │
                    │ in_progress
                    └──────────┘
```

## Backend State Shape (in-memory)

```typescript
interface Room {
  code: string;
  status: "lobby" | "playing";
  participants: Participant[];
  hostId: string;
  currentRound: Round | null;       // NEW
  createdAt: string;
  updatedAt: string;
}

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
}

interface Round {                     // NEW
  number: number;
  drawerId: string;
  secretWord: string;
  status: "in_progress" | "completed";
}
```

## Frontend State Shape

```typescript
interface RoomState {
  room: RoomSnapshot | null;
  participantId: string | null;
  error: string | null;
  isLoading: boolean;
  pollError: string | null;
}

interface RoomSnapshot {
  code: string;
  status: "lobby" | "playing";
  participants: Participant[];
  hostId: string;
  isHost: boolean;
  drawerId: string | null;           // NEW — visible to all
  secretWord: string | undefined;    // NEW — only set when viewer is drawer
  availableWords: string[];
  roles: ParticipantRole[];
}
```
