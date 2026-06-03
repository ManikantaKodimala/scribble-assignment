# Research: Round End Results & Restart

## Unknowns Resolved

### 1. How does a round end currently?

**Decision**: Round completion is already tracked (`round.status === "completed"`, surfaced as `roundComplete` in RoomSnapshot), but no state transition occurs — `room.status` stays `"playing"`. The secret word is NOT revealed to non-drawers after completion.

**Rationale**: The existing `submitGuess` function transitions `round.status` from `"in_progress"` → `"completed"` when all guessers solve correctly. No auto-advance or state change exists beyond that.

**Alternatives considered**: N/A — existing behavior discovered via codebase exploration.

---

### 2. How should the "results" state be modeled?

**Decision**: Reuse the existing `roundComplete` flag (derived from `round.status === "completed"`) rather than adding a new `"results"` RoomStatus. This minimizes changes — no enum expansion, no migration. The frontend navigates to ResultsPage when polling detects `roundComplete === true` and `room.status === "playing"`.

**Rationale**: Brownfield discipline (Constitution V) — work within existing patterns. Adding a `"results"` status would require updating `RoomStatus` type, validation, and all status checks. The `roundComplete` boolean already signals the exact same information.

**Alternatives considered**: Add `"results"` as a new RoomStatus value. Rejected because it introduces more surface-area changes without additional value.

---

### 3. How does the frontend detect a round has ended?

**Decision**: The GamePage must start polling when mounted (it currently does not poll at all). When polling detects `roundComplete === true`, redirect to `/results`.

**Rationale**: The spec requires the results screen to appear automatically (FR-001). Since there's no WebSocket push, the GamePage must poll to detect the state change. The LobbyPage already demonstrates the polling pattern (2s intervals).

**Alternatives considered**: Relay state through navigation (passing data via React Router state). Rejected because restart would need to trigger cross-client navigation, which requires polling.

---

### 4. How is the secret word revealed to all players on the results screen?

**Decision**: Modify `toRoomSnapshot` to include `secretWord` when `roundComplete` is true (regardless of viewer role). Currently it only includes the word for the drawer.

**Rationale**: FR-002 requires all players to see the secret word on the results screen.

**Alternatives considered**: Create a separate endpoint `GET /rooms/:code/results`. Rejected — simpler to extend the existing snapshot, reducing round trips.

---

### 5. How does the restart mechanism work?

**Decision**: New `POST /api/rooms/:code/restart` endpoint:
- Host-only (validated by `participantId`)
- Clears: `scores = {}`, `currentRound = null`, `drawerId = null`
- Sets: `room.status = "lobby"`
- Preserves: `participants`, `hostId`, `code`
- Returns updated `RoomSnapshot`

**Rationale**: A dedicated endpoint provides an explicit server-side action that all clients detect via polling. No WebSocket push needed.

**Alternatives considered**: Reuse `startGame` with a reset flag. Rejected — `startGame` has different validation (requires lobby status, ≥2 players). A separate endpoint is cleaner.

---

### 6. How does the frontend detect a restart?

**Decision**: The ResultsPage polls `fetchRoom()`. When `room.status` changes back to `"lobby"` (and `roundComplete` becomes `false`), navigate to `/lobby`.

**Rationale**: Same polling mechanism as the existing LobbyPage. No new infrastructure needed.

**Alternatives considered**: Pass a flag in the restart response. Rejected — polling is the universal sync mechanism per FR-010.

---

### 7. What happens to the Scoreboard and ResultPanel components?

**Decision**: 
- `Scoreboard`: Replace placeholder with real rendering of `room.scores` (sorted by score descending).
- `ResultPanel`: Currently unused — will be replaced by the new ResultsPage.
- Both components serve the results screen view.

**Rationale**: FR-003 requires showing final scores. The Scoreboard component already has the right name and location — just needs implementation.

**Alternatives considered**: Create from scratch. Rejected — existing components should be fixed per Brownfield Discipline.

---

### 8. How does the host restart flow work?

**Decision**: 
- Host sees "Restart Game" button on ResultsPage
- Non-host sees "Waiting for host to start next game..."
- On click: `POST /api/rooms/:code/restart` → polling picks up `status: "lobby"` → navigate to `/lobby`

**Rationale**: FR-005 through FR-009. Clear host/non-host differentiation with no new auth.

**Alternatives considered**: N/A — directly from spec acceptance scenarios.

---

## Technology & Pattern Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Results state detection | `roundComplete` flag (existing) | Min change, no new enum |
| Results page route | `/results` | New route, follows `/lobby` + `/game` pattern |
| Polling on GamePage | Add polling (2s) | Required for auto-redirect to results |
| Secret word reveal | Include in snapshot when `roundComplete` | Single source of truth |
| Restart endpoint | `POST /api/rooms/:code/restart` | Explicit, host-only, preserves participants |
| Restart detection | Polling detects `status: "lobby"` | Same mechanism as everything else |
| Scores display | Fix Scoreboard component | Brownfield — reuse existing |
| ResultPanel component | Leave unused (ResultsPage replaces it) | Dead code, but not in use path |
