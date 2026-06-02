# Implementation Plan: First Round Start

**Branch**: `002-first-round-start` | **Date**: 2026-06-02 | **Spec**: [.specify/specs/002-first-round-start/spec.md](spec.md)

**Input**: Feature specification from `.specify/specs/002-first-round-start/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

When the host starts the game, round 1 begins with the host assigned as drawer. A secret word is deterministically selected from the starter list and shown only to the drawer. Player names are trimmed on input and empty/whitespace-only names are rejected with a clear error message.

## Technical Context

**Language/Version**: TypeScript 5.6 (backend + frontend)

**Primary Dependencies**: Express 4 + Zod 3 (backend), React 18 + React Router 6 (frontend)

**Storage**: In-memory only (no database)

**Testing**: Vitest 3 (node env for backend, jsdom env for frontend)

**Target Platform**: Web browser (modern) + Node.js server

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Name validation under 1s; round word reveal within 2s poll cycle; word selection under 50ms

**Constraints**: In-memory only; no WebSockets; no databases; no authentication; no new state-management or routing libraries beyond what the starter ships

**Scale/Scope**: Small — single server, small number of concurrent rooms

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Rationale |
|-----------|--------|-----------|
| I. TypeScript Strictness | ✅ Pass | All new types (Round, extended RoomSnapshot) fully typed; no `any` |
| II. Stateless Server | ✅ Pass | Round state in-memory, no persistence, no WebSockets, HTTP polling |
| III. Spec-First Development | ✅ Pass | Spec exists and was clarified before planning |
| IV. Edge Case Rigor | ✅ Pass | Spec covers blank names, whitespace-only names, word secrecy, deterministic selection |
| V. Brownfield Discipline | ✅ Pass | All changes extend existing files; no new libraries or structural changes |

**Gate decision**: All gates pass. No violations require justification.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/002-first-round-start/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts          # Round type, currentRound on Room, drawerId/secretWord on RoomSnapshot
│   ├── services/
│   │   └── roomStore.ts      # selectWord(), round creation in startGame(), name validation, word filtering in toRoomSnapshot()
│   └── api/
│       ├── schemas.ts        # playerName -> trimmed, min(1) validation
│       └── rooms.ts          # Error handling for name validation failures
├── tests/
│   └── (vitest tests inline with source)

frontend/
├── src/
│   ├── services/
│   │   └── api.ts            # drawerId, secretWord fields on RoomSnapshot
│   ├── pages/
│   │   ├── CreateRoomPage.tsx  # Client-side name trimming + validation
│   │   ├── JoinRoomPage.tsx    # Client-side name trimming + validation
│   │   └── GamePage.tsx       # Drawer identification, word reveal for drawer, "is drawing" for guessers
│   └── state/
│       └── roomStore.ts       # (no changes needed unless polling behavior for word changes)
└── tests/
    └── (vitest tests for new validation and drawer logic)
```

**Structure Decision**: Web application (frontend + backend). All changes extend existing files with minimal additions, following established patterns.

## Complexity Tracking

> Not needed — Constitution Check passed with no violations.

## Phase 0 — Research

No NEEDS CLARIFICATION markers exist in the Technical Context. All technology choices are established by the project starter and constitution. Research artifacts written to `research.md`.

### Key Decisions

- Word selection: `sum(charCode of roomCode) % wordList.length`
- Name validation: Zod `z.string().trim().min(1)` on schemas + client-side check
- Word secrecy: `toRoomSnapshot()` omits `secretWord` for non-drawer viewers

## Phase 1 — Design

Design artifacts generated:
- `data-model.md` — Round entity, extended Room/RoomSnapshot schemas
- `contracts/api.md` — Updated API contracts with new fields and validation
- `quickstart.md` — Ordered implementation steps

### Re-check Constitution

| Principle | Status | Rationale |
|-----------|--------|-----------|
| I. TypeScript Strictness | ✅ Pass | All types interface-based; no `any` in new code |
| II. Stateless Server | ✅ Pass | Rounds stored in-memory on Room; word selection is pure function |
| III. Spec-First Development | ✅ Pass | Spec completed and clarified prior to planning |
| IV. Edge Case Rigor | ✅ Pass | Empty/whitespace names, word leakage prevention, deterministic selection |
| V. Brownfield Discipline | ✅ Pass | Extends existing types, services, routes; no new files in src/ |

**Gate decision**: All gates pass.
