---

description: "Task list for Round End Results & Restart feature"
---

# Tasks: Round End Results & Restart

**Input**: Design documents from `.specify/specs/004-round-end-results/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup needed — project is already initialized with all dependencies. Skipping this phase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend functions and frontend API/store methods required by both user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 Backend: Add `restartGame()` to roomStore and update `toRoomSnapshot` to include `secretWord` for all viewers when `roundComplete` is true in `backend/src/services/roomStore.ts`
- [X] T002 [P] Frontend: Add `restartGame()` method to `api.ts` in `frontend/src/services/api.ts`
- [X] T003 Frontend: Add `restartGame()` method to `RoomStore` in `frontend/src/state/roomStore.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - All Players View Round-End Results (Priority: P1) 🎯 MVP

**Goal**: When a round ends, all players automatically see a results screen showing the correct word, final scores for the round, and the complete guess history.

**Independent Test**: After a round ends via all guessers solving correctly, every player in the room sees the results screen with the secret word revealed, scores displayed, and all guesses listed. No action required from any player.

### Implementation for User Story 1

- [X] T004 [P] [US1] Fix `Scoreboard` component to render `room.scores` (sorted descending, player name + points) in `frontend/src/components/Scoreboard.tsx`
- [X] T005 [US1] Add polling (2s interval) to `GamePage`; when poll detects `roundComplete === true`, navigate to `/results` in `frontend/src/pages/GamePage.tsx`
- [X] T006 [US1] Create `ResultsPage` showing:
  - Secret word (revealed to all)
  - Final scores via `Scoreboard` component
  - Full guess history via `GuessHistory` component
  - "Waiting for host to start next game" message (non-host) or nothing yet for host
  in `frontend/src/pages/ResultsPage.tsx`
- [X] T007 [US1] Add `/results` route pointing to `ResultsPage` in `frontend/src/routes/index.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional — round ends, results screen appears automatically with word/scores/guesses. Host restart not yet implemented.

---

## Phase 4: User Story 2 - Host Restarts the Game (Priority: P1)

**Goal**: The host sees a "Restart Game" button on the results screen. When clicked, all players return to the lobby with participants preserved and all round state cleared.

**Independent Test**: Host clicks "Restart Game" in the results view. All players in the room are redirected to the lobby, still listed as participants, with scores reset to zero and no active round.

### Implementation for User Story 2

- [X] T008 [US2] Add `POST /:code/restart` route (host-only validation, calls `restartGame()`, returns `RoomSnapshot`) in `backend/src/api/rooms.ts`
- [X] T009 [US2] Add restart button (visible only to host), "Waiting for host to start next game" message (non-host), and restart-detection polling (when poll returns `status === "lobby"`, navigate to `/lobby`) to `ResultsPage` in `frontend/src/pages/ResultsPage.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work — round ends → results screen → host clicks restart → all back in lobby with scores reset.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and edge-case hardening.

- [X] T010 [P] Verify backend tests pass for existing roomStore and schemas (no regressions) via `cd backend && npx vitest run`
- [X] T011 [P] Verify frontend tests pass (no regressions) via `cd frontend && npx vitest run`
- [ ] T012 Run end-to-end manual validation: two-browser-tab test of full flow (play round → results → restart → lobby → play again) — **requires manual testing**
- [ ] T013 Verify edge cases: host leaves during results (auto-promotion), solo player restart, late joiner sees results — **requires manual testing**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Skipped (no setup needed)
- **Foundational (Phase 2)**: Must complete before user stories — T002 and T003 can run in parallel with T001
- **User Stories (Phase 3-4)**: Must complete Phase 2 first
  - US1 (Phase 3) and US2 (Phase 4) are designed to be implemented sequentially
  - With parallel team: once Phase 2 is done, US1 and US2 can be done in parallel since they touch different files
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: No backend work beyond Phase 2 — all frontend tasks (different files)
  - T004 is independent (Scoreboard only)
  - T005 depends on none (adds polling to GamePage)
  - T006 creates ResultsPage (no deps on other US1 tasks)
  - T007 depends on T006 (ResultsPage must exist)
- **US2 (P2)**: Depends on T001 (restartGame in roomStore) and T003 (restartGame in RoomStore)
  - T008 depends on T001 (backend route needs roomStore function)
  - T009 depends on T003 + T006 (store method + ResultsPage must exist)

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **T002 and T003** can run in parallel (different files)
- **T004** is fully independent — can run at any time
- **T005, T006** are independent — can run in parallel
- **T008, T009** must be sequential — T008 (backend route) before T009 (frontend button)
- Polish tasks T010 and T011 can run in parallel

---

## Parallel Example: User Story 1

```bash
# T004 and T006 can be launched together:
Task: "Fix Scoreboard to render room.scores in frontend/src/components/Scoreboard.tsx"
Task: "Create ResultsPage in frontend/src/pages/ResultsPage.tsx"

# T005 independent:
Task: "Add polling to GamePage in frontend/src/pages/GamePage.tsx"
```

## Parallel Example: User Story 2

```bash
# Sequential — T008 first, then T009:
Task: "Add POST /:code/restart route in backend/src/api/rooms.ts"
Task: "Add restart button + polling to ResultsPage in frontend/src/pages/ResultsPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T003)
2. Complete Phase 3: User Story 1 (T004-T007)
3. **STOP and VALIDATE**: Test User Story 1 independently — play a round, verify results screen appears
4. Deploy/demo if ready (shows results but no restart — players must refresh page)

### Incremental Delivery

1. Complete Phase 2 → Foundation ready
2. Add US1 (Phase 3) → Test independently → **MVP complete!** (results screen visible)
3. Add US2 (Phase 4) → Test independently → **Full feature complete!** (restart works)
4. Polish (Phase 5) → Validate no regressions

### Parallel Team Strategy

With two developers:

1. Both complete Phase 2 together (T001/T002 parallel, then T003)
2. Once Phase 2 is done:
   - Developer A: User Story 1 (T004-T007)
   - Developer B: User Story 2 (T008-T009, but wait for T006)
3. Since T009 depends on T006 (ResultsPage), Developer B starts with T008, then waits for T006 before T009

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No test tasks included (not requested in spec)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
