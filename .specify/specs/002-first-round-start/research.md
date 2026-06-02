# Research: First Round Start

No unresolved unknowns. All technology choices are established by the project starter and constitution:

- **Backend language**: TypeScript 5.6 (already in use)
- **Frontend framework**: React 18 + Vite 5 (already in use)
- **Validation**: Zod 3 (already in use)
- **Testing**: Vitest 3 (already in use)
- **Sync mechanism**: HTTP polling (constitution mandate, no WebSockets)
- **Storage**: In-memory (constitution mandate, no database)

## Decisions

### Player Name Validation
- **Decision**: Client-side + server-side validation. Zod schema rejects empty/whitespace-only names. Backend `displayName()` is updated to trim and enforce non-empty.
- **Rationale**: Defense in depth — UI provides instant feedback, server enforces invariants.
- **Alternatives considered**: Client-only (fails on direct API calls), server-only (worse UX).

### Deterministic Word Selection
- **Decision**: `hash = sum(charCode of each room code char) % wordList.length`
- **Rationale**: Simple, fast, no external dependencies. Guarantees the same room always gets the same word.
- **Alternatives considered**: Hash of `roomCode + roundNumber` (over-engineered for v1), random selection (not deterministic).

### Drawer Identification
- **Decision**: A `drawerId` field on the `RoomSnapshot` plus a `currentRound` object with the secret word (sent only to the drawer).
- **Rationale**: Minimal diff to existing `RoomSnapshot`. The `drawerId` is visible to all; the `secretWord` field is included only when the viewer is the drawer.
- **Alternatives considered**: Separate `/rounds` endpoint (unnecessary complexity for v1), embedding word in `roles` array (confusing semantics).
