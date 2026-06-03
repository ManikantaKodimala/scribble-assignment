# Data Model: Round End Results & Restart

## Entity: Room (No structural changes)

The existing `Room` type is sufficient. No new fields required.

| Field | Existing | Change |
|---|---|---|
| `status` | `"lobby" \| "playing"` | Unchanged — reuse `roundComplete` flag |
| `scores` | `Record<string, number>` | Unchanged — cumulative across rounds; reset on restart |
| `currentRound` | `Round \| null` | Unchanged — cleared on restart |

## State Transitions

```
    ┌──────────┐       all guessers solve       ┌─────────────────┐
    │  Playing  │ ──────────────────────────────► │  Playing (done)  │
    │  (active) │                                  │  roundComplete=1 │
    └──────────┘                                  └────────┬────────┘
            ▲                                               │
            │                                      host clicks
            │                                      "Restart"
            │                                               │
            │                                               ▼
            │                                    ┌──────────────────┐
            └────────────────────────────────────│      Lobby       │
                    restartGame()                │ (scores=0, no    │
                                                 │  currentRound)   │
                                                 └──────────────────┘
```

No new `RoomStatus` value needed. The existing `room.status === "playing"` combined with `room.currentRound?.status === "completed"` signals "show results." After restart, `room.status` returns to `"lobby"` and `currentRound` is cleared.

## Key Behaviors

### Results Detection (Backend)
- `toRoomSnapshot` already computes `roundComplete: room.currentRound?.status === "completed"`
- **NEW**: When `roundComplete` is true, include `secretWord` for ALL viewers (not just drawer)

### Restart Action (Backend — New Function)
```typescript
function restartGame(code: string, participantId: string): Room | null
```
- Validates room exists
- Validates caller is host
- Resets: `room.scores = {}`, `room.currentRound = null`
- Sets: `room.status = "lobby"`
- Preserves: `room.participants`, `room.hostId`, `room.code`

### Results Detection (Frontend)
- GamePage starts polling (similarly to LobbyPage)
- When poll returns `roundComplete === true`, navigate to `/results`
- ResultsPage polls and shows results data from snapshot
- When poll returns `status === "lobby"` (after restart), navigate to `/lobby`

## Data Flow

```
Round ends (allSolved)         submitGuess:514
         │
         ▼
round.status = "completed"     roomStore.ts:206
         │
         ▼
toRoomSnapshot includes         roomStore.ts:239
  secretWord for all viewers
  roundComplete = true
         │
         ▼
GamePage polls / GET /rooms     GamePage.tsx (new polling)
         │
         ▼
roundComplete === true ────────► navigate("/results")
         │
         ▼
ResultsPage polls / GET /rooms  ResultsPage.tsx (new)
   shows: word, scores, guesses
         │
         ▼
Host clicks "Restart" ─────────► POST /rooms/:code/restart
         │                        room.status = "lobby"
         ▼                        currentRound = null
Poll detects status="lobby" ───► navigate("/lobby")
```
