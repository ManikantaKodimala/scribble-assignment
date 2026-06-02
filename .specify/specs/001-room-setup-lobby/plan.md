# Implementation Plan: Room Setup & Lobby

**Branch**: `assignment` | **Date**: 2026-06-01 | **Spec**: [.specify/specs/001-room-setup-lobby/spec.md](spec.md)

**Input**: Feature specification from `.specify/specs/001-room-setup-lobby/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Players can create or join a drawing game room via a unique 4-character code. The creator
is automatically the host. Invalid/empty codes are rejected with clear feedback. The lobby
auto-refreshes the participant list via HTTP polling every ~2 seconds. Only the host can
start the game, and only when at least 2 players are present. Non-host participants are
auto-navigated to the game screen when the poll detects the game has started.

## Technical Context

**Language/Version**: TypeScript 5.6 (backend + frontend)

**Primary Dependencies**: Express 4 + Zod 3 (backend), React 18 + React Router 6 (frontend)

**Storage**: In-memory only (no database)

**Testing**: Vitest 3 (node env for backend, jsdom env for frontend)

**Target Platform**: Web browser (modern) + Node.js server

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Lobby polling at ~2s intervals; snapshot responses under 500ms;
room creation under 3s end-to-end

**Constraints**: In-memory only; no WebSockets; no databases; no authentication; no new
state-management or routing libraries beyond what the starter ships

**Scale/Scope**: Small — single server, small number of concurrent rooms

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Rationale |
|-----------|--------|-----------|
| I. TypeScript Strictness | ✅ Pass | All new code will be fully typed; no `any` |
| II. Stateless Server | ✅ Pass | All game state in-memory; HTTP polling for sync |
| III. Spec-First Development | ✅ Pass | Spec completed and clarified in prior phases |
| IV. Edge Case Rigor | ✅ Pass | Spec covers empty codes, whitespace, isolation, polling failures, duplicate names |
| V. Brownfield Discipline | ✅ Pass | All changes work within existing file structure |

**Gate decision**: All gates pass. No violations require justification.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/001-room-setup-lobby/
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
│   │   └── game.ts          # Room, Participant, RoomSnapshot types
│   ├── services/
│   │   └── roomStore.ts      # Room CRUD, polling, start game
│   └── api/
│       ├── router.ts         # Express router setup
│       ├── rooms.ts          # POST /rooms, POST /:code/join, GET /:code, POST /:code/start
│       └── schemas.ts        # Zod validation schemas
├── tests/
│   └── (vitest tests inline with source)
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── AppShell.tsx
│   │   ├── GuessForm.tsx
│   │   ├── LobbyStatus.tsx   # (new) polling error indicator
│   │   ├── RoomCodeBadge.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── CreateRoomPage.tsx
│   │   ├── JoinRoomPage.tsx
│   │   ├── LobbyPage.tsx     # (updated) auto-polling, host-only start
│   │   └── GamePage.tsx
│   ├── services/
│   │   └── api.ts            # (updated) startGame, host/permission fields
│   ├── state/
│   │   └── roomStore.ts      # (updated) polling interval, error state
│   └── styles/
│       └── app.css           # (minor additions for poll error indicator)
├── tests/
│   └── (vitest tests inline with source)
└── package.json
```

**Structure Decision**: Web application (frontend + backend). All changes extend existing
files and add minimal new files following established patterns.

## Complexity Tracking

> Not needed — Constitution Check passed with no violations.

## Phase 0 — Research

No NEEDS CLARIFICATION markers exist in the Technical Context. All technology choices are
specified by the project starter and constitution. Research is not needed; proceeding to
Phase 1 design.
