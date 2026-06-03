# Implementation Plan: Round End Results & Restart

**Branch**: `assignment` | **Date**: 2026-06-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `./spec.md`

## Summary

Display a results screen to all players when a drawing round ends, showing the secret word, final scores, and full guess history. The host sees a "Restart Game" button that returns everyone to the lobby with participants preserved and all round state cleared. All sync uses the existing HTTP polling mechanism (no WebSockets).

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20+), React 18

**Primary Dependencies**: Express + Zod (backend), Vite + React Router v6 (frontend), Vitest (testing)

**Storage**: In-memory only (per Constitution II — Stateless Server)

**Testing**: Vitest (both backend node and frontend jsdom environments)

**Target Platform**: Web browser (Chrome, Firefox, Safari)

**Project Type**: Web application (monorepo: backend + frontend)

**Performance Goals**: Results screen visible within 3s of round end (SC-001); restart propagates in ≤3s (SC-002)

**Constraints**: No WebSockets, no database, no auth; polling interval ~2s; ≤10 players per room; existing room cleanup TTL; must use existing file/folder conventions

**Scale/Scope**: Single game instance, ≤10 concurrent players per room

**Assumptions**:
- Time-limit round-end is not implemented (spec.md mentions it as an aspirational trigger). Only all-guessers-solved triggers round end.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Check | Notes |
|---|-----------|-------|-------|
| I  | TypeScript Strictness | ✅ PASS | All new types declared, no `any`, immutable where possible |
| II | Stateless Server | ✅ PASS | In-memory + polling only, no DB/WS/auth per spec FR-010 concurrence |
| III| Spec-First Development | ✅ PASS | Spec exists, clarified, proceeding to plan |
| IV | Edge Case Rigor | ✅ PASS | 4 edge cases documented in spec; host disconnect, solo player, late joiner, all leave |
| V  | Brownfield Discipline | ✅ PASS | Uses existing room/polling infrastructure; no new libraries needed |

**Result**: GATE PASSED — No violations to justify.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/004-round-end-results/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: Web application monorepo — `backend/` for Express API, `frontend/` for React SPA. Follows existing project layout per Constitution V.
