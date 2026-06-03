# Tasks: Guess Submission & Scoring

**Input**: Design documents from `.specify/specs/003-guess-scoring/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No explicit test tasks requested — implementation-focused tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths below reflect the existing project structure

---

## Phase 1: Foundational — Models & Types (Blocking Prerequisites)

**Purpose**: Core type/model changes that MUST be complete before ANY user story implementation.

- [x] T001 [P] Add `Guess` interface and extend `Round` (add `guesses`, `solvedParticipantIds`, `status`) in `backend/src/models/game.ts`
- [x] T002 [P] Add `guesses` and `scores` fields to `RoomSnapshot` in `backend/src/models/game.ts`
- [x] T003 [P] Define `GuessResult` type in `backend/src/models/game.ts` and update `Guess` interface and add `roundComplete` to `RoomSnapshot` in `frontend/src/services/api.ts`

**Checkpoint**: Foundational types ready — user story implementation can now begin.

---

## Phase 2: User Story 1 — Guesser Submits a Guess (Priority: P1) 🎯 MVP

**Goal**: Guessers can submit text guesses during an active round. The system trims whitespace, rejects empty guesses, compares case-insensitively against the secret word, and returns a correct/incorrect result with score updates.

**Independent Test**: A guesser types a guess, submits it, and sees a "Correct!" or "Incorrect" result immediately. Their score updates on a correct answer. On network failure, an inline error is shown below the input and the form stays enabled for retry.

### Implementation for User Story 1

- [x] T004 [US1] Add `submitGuess(roomCode, participantId, guessText)` function in `backend/src/services/roomStore.ts` — trim guess, reject empty, verify round active, verify submitter is not the drawer, case-insensitive comparison, award 100 points on first correct guess, add to guess history, round end check (set completed, game waits)
- [x] T005 [P] [US1] Create `guessBodySchema` in `backend/src/api/schemas.ts` — validate `participantId` and `guess` string (trimmed, min 1 char)
- [x] T006 [US1] Add `POST /rooms/:code/guess` route in `backend/src/api/rooms.ts` — validate request, call `submitGuess`, return `GuessResult`
- [x] T007 [US1] Update `toRoomSnapshot()` in `backend/src/services/roomStore.ts` to include `guesses` array and `scores` map in the response
- [x] T008 [P] [US1] Add `submitGuess(code, participantId, guess)` API method in `frontend/src/services/api.ts`
- [x] T009 [US1] Add `submitGuess`, `scores`, `guesses`, `guessResult`, `roundComplete` to room store in `frontend/src/state/roomStore.ts`
- [x] T010 [US1] Update `GuessForm` in `frontend/src/components/GuessForm.tsx` — submit guess via store, display "Correct!" or inline error on failure, form stays enabled for retry, disable form after correct guess or round complete

**Checkpoint**: At this point, a guesser can submit guesses and get immediate correct/incorrect feedback with score updates. The backend fully processes guesses.

---

## Phase 3: User Story 2 — Drawer Sees Canvas and Guesses (Priority: P1)

**Goal**: The drawer sees their drawing canvas and a live-updating list of guesses from all guessers during the round.

**Independent Test**: The drawer sees the canvas with their drawing and a list of guesses submitted by any guesser, updated via polling.

### Implementation for User Story 2

- [x] T011 [P] [US2] Create `GuessHistory` component in `frontend/src/components/GuessHistory.tsx` — show ordered list of guesses with submitter name, guess text, correct/incorrect marker
- [x] T012 [US2] Update `GamePage` in `frontend/src/pages/GamePage.tsx` — show `GuessHistory` in drawer sidebar, show canvas for drawer, show guesser view with guess history
- [x] T013 [US2] Add styles for guess history and drawer banner in `frontend/src/styles/app.css`
- [x] T014 [US2] Add `clearCanvas(roomCode, participantId)` function in `backend/src/services/roomStore.ts` — verify caller is the drawer, reset canvas state. Add route `POST /rooms/:code/clear` in `backend/src/api/rooms.ts` with Zod validation. Wire the "Clear Canvas" button in `frontend/src/pages/GamePage.tsx` to call the API, visible only to the drawer

**Checkpoint**: The drawer can see the canvas, clear it, and view incoming guesses from all guessers in real-time via polling.

---

## Phase 4: User Story 3 — Guess History Synced via Polling (Priority: P2)

**Goal**: All players (drawer and guessers) see the same guess history for the current round, updated regularly via the existing HTTP polling mechanism.

**Independent Test**: Two browser tabs (one drawer, one guesser) show the same guess history within 3 seconds of a guess being submitted. When all guessers solve, the round complete state is visible to all players and the game waits.

### Implementation for User Story 3

- [x] T015 [US3] Add `roundComplete` field to `RoomSnapshot` in `frontend/src/services/api.ts` (if not already added in T003)
- [x] T016 [US3] Integrate guess/scores polling into the existing poll loop in `frontend/src/state/roomStore.ts` — ensure `fetchRoom` updates `guesses` and `scores` from poll response
- [x] T017 [US3] Show "Round Complete" state in `GamePage` when `roundComplete` is true from poll response; game waits for host/drawer to start next round

**Checkpoint**: All players see the same guess history and scores synced via polling. The round complete state is visible to all.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final verification.

- [x] T018 Run through `quickstart.md` verification steps to confirm full end-to-end flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately (self-contained type changes)
- **US1 (Phase 2)**: Depends on Phase 1 (model types)
- **US2 (Phase 3)**: Depends on Phase 1 (model types); US1 backend should be complete for full testing
- **US3 (Phase 4)**: Depends on Phase 1 (model types); benefits from US1 and US2 integration
- **Polish (Phase 5)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: No code dependency on other stories — can be implemented first
- **US2 (P1)**: Depends on backend changes from US1 (for guess data flowing through RoomSnapshot) — implement after US1
- **US3 (P2)**: Depends on US1 (guess data) and US2 (frontend components) — implement last

### Within Each User Story

- Models before services
- Services before endpoints
- Backend before frontend
- Story complete before moving to next phase

### Parallel Opportunities

- T001, T002, T003 (foundational types) can run in parallel
- T005 (Zod schema) can run in parallel with T004 (service logic)
- T008 (frontend API method) can run in parallel with T004-T006 (backend)
- T011 (GuessHistory component) can run in parallel with T012 (GamePage update)
- T014 (canvas clearing) can run in parallel with T011-T013 (US2 frontend)

---

## Parallel Example: User Story 1

```bash
# Launch all backend tasks for User Story 1 together:
Task: "Add submitGuess service logic in backend/src/services/roomStore.ts"
Task: "Create guessBodySchema in backend/src/api/schemas.ts"
Task: "Add POST /:code/guess route in backend/src/api/rooms.ts"

# Launch frontend tasks in parallel:
Task: "Add submitGuess API method in frontend/src/services/api.ts"
Task: "Update room store with guess/score state in frontend/src/state/roomStore.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational types
2. Complete Phase 2: User Story 1 (guesser submission + scoring)
3. **STOP and VALIDATE**: Guesser can submit correct/incorrect guesses, score updates
4. Deploy/demo if ready

### Incremental Delivery

1. Add US1 (guess submission + scoring) → Test independently → MVP complete
2. Add US2 (drawer views + guess history display) → Test independently → Core UX complete
3. Add US3 (polling sync + round end) → Test independently → Full spec complete

### Parallel Team Strategy

With multiple developers:

1. Developer A: US1 (guess submission backend + frontend)
2. Developer B: US2 (canvas display, GuessHistory component)
3. Start US3 after US1 foundational tasks complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
