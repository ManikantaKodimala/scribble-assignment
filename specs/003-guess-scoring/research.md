# Research: Guess Submission & Scoring

## Technology Decisions

| Decision | Choice | Rationale | Alternatives Considered |
|----------|--------|-----------|------------------------|
| Guess submission protocol | HTTP POST via Express route | Existing pattern (`POST /rooms/:code/start`) | WebSockets (forbidden by constitution) |
| Polling interval | 2 seconds | Matches existing lobby polling (`POLL_INTERVAL_MS = 2000`) | 1s (too chatty), 3s+ (too slow for UX target) |
| State storage | In-memory on Room object | Guesses and scores belong to a round/room; no DB allowed | Redis/Memcached (forbidden by constitution) |
| Validation | Zod schema | Existing pattern (`createRoomSchema`, `joinRoomSchema`) | Manual validation (inconsistent with codebase) |
| Scoring | 100 points on first correct guess per round per player | Spec requirement | Variable scoring (deferred) |
| Case-insensitive comparison | `.toLowerCase()` on both guess and secret word | Simple, no locale issues for English words | Intl.Collator (overkill), regex (unnecessary) |
| Guess history sync | Included in existing room polling response | No new polling endpoint needed; guess history added to RoomSnapshot | Separate polling endpoint (more complexity) |

## Key Findings

1. **Existing polling infrastructure** (`LOBBY_POLL_INTERVAL` in `LobbyPage.tsx`) can be adapted for game polling. The same `fetchRoom` mechanism returns `RoomSnapshot` — adding a `guesses` array to the snapshot covers history sync without new endpoints.

2. **Scoring is per-round, cumulative across game**. Scores reset when a new game starts but persist across rounds within a game. Only the first correct guess per player per round earns points.

3. **Round lifecycle**: Round ends when all guessers guess correctly. The game then waits — the host or drawer must explicitly start the next round. The round status transitions from "in_progress" to "completed"; the game stays in "playing" state.

4. **Drawing canvas** is out of scope for this feature — the spec assumes canvas exists; this feature only needs to ensure it's visible on the drawer's screen.

5. **Error handling UX**: Guess submission failures display an inline error below the input; the form remains enabled for retry. Poll failures show a subtle error banner and keep polling active — no modal or full-page error needed at this scale.

6. **No rate limiting needed**: With ≤10 participants and in-memory state, rapid guess submissions are handled gracefully without throttling.

## Risks

- **Race condition**: Two guessers submit correct guesses simultaneously — both should score 100 if both are first-correct, but after both are processed the round should end. Backend processes sequentially per request, so no race condition in single-threaded Node.js.
- **Poll delay**: 2s polling means up to 2s delay between a guess being submitted and appearing on other players' screens. This is acceptable per SC-002 (3 seconds).
