# Implementation Plan: Guess Submission & Scoring

**Branch**: `assignment` | **Date**: 2026-06-02 | **Spec**: .specify/specs/003-guess-scoring/spec.md

**Input**: Feature specification from `.specify/specs/003-guess-scoring/spec.md`

## Summary

Add guess submission and scoring mechanics to the active drawing round. Guessers submit text guesses which are trimmed, case-insensitively compared against the secret word, and scored (100 points for a correct first guess). All guesses (correct and incorrect) appear in a per-round guess history synced to all players via HTTP polling. The round ends when all guessers have guessed correctly; the game then waits for the host or drawer to explicitly start the next round.

## Technical Context

**Language/Version**: TypeScript (backend Node.js, frontend React 18 with Vite)

**Primary Dependencies**: Express (backend), Zod (validation), Vitest (testing)

**Storage**: In-memory only (no database) — scores and guesses stored on the Room object

**Testing**: Vitest for both backend (node) and frontend (jsdom)

**Target Platform**: Web browser (modern Chrome, Firefox, Safari)

**Project Type**: Web application (monolith with backend/ + frontend/)

**Performance Goals**: Guess submission result (or inline error) within 2 seconds; history sync within 3 seconds via 2s polling

**Constraints**: No WebSockets (HTTP polling only), no database, no authentication, in-memory state only

**Scale/Scope**: Single game room with up to 10 participants

**Error Handling**: Guess submission failures show inline error below input; form stays enabled for retry. Poll failures show subtle error banner and keep polling active.

**Out of Scope**: Multi-round orchestration (next round start, word selection, round timer) and game-over state management. This feature covers a single round's guess submission, scoring, and history sync only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| TypeScript Strictness | ✅ PASS | Existing codebase already typed; new Guess/Score/history types will follow conventions |
| Stateless Server | ✅ PASS | All guess/score state stored in-memory on Room object; no DB or WebSockets |
| Spec-First | ✅ PASS | Spec exists and has been clarified; this plan follows it |
| Edge Case Rigor | ✅ PASS | Validation (trim, empty reject, case-insensitive) explicitly required; multi-room isolation tested |
| Brownfield Discipline | ✅ PASS | Uses existing roomStore, roomStore pattern, polling infrastructure; no new libs |

## Project Structure

```text
.specify/specs/003-guess-scoring/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Created by /speckit.tasks

backend/src/
├── models/
│   └── game.ts          # Add Guess, GuessResult types
├── services/
│   ├── roomStore.ts     # Add guess submission, scoring logic, history management
│   └── roomStore.test.ts
├── api/
│   ├── schemas.ts       # Add guess submission validation schema
│   ├── schemas.test.ts
│   └── rooms.ts         # Add POST /:code/guess endpoint
├── router.ts

frontend/src/
├── services/
│   └── api.ts           # Add submitGuess, guess polling API calls
├── state/
│   └── roomStore.ts     # Add guess state, submitGuess action, poll integration
├── pages/
│   └── GamePage.tsx     # Show guess history, drawer/guesser views
├── components/
│   ├── GuessForm.tsx    # Update to handle guess submission + validation
│   └── GuessHistory.tsx (new) # Display live guess history
├── styles/app.css
```

**Structure Decision**: Web application monorepo with `backend/` and `frontend/` directories. This matches the existing project structure.

## Complexity Tracking

> No constitution violations — all gates pass.
