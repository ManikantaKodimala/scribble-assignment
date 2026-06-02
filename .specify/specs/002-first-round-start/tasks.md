# Tasks: First Round Start

**Input**: Design documents from `.specify/specs/002-first-round-start/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks included per user story (TDD approach — write test first, then implement).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths below reflect the existing project structure

---

## Phase 1: User Story 1 - Player Name Validation (Priority: P1) 🎯 MVP

**Goal**: Player names are trimmed on input and empty/whitespace-only names are rejected with a clear error message on both create and join flows.

**Independent Test**: Enter a blank or whitespace-only name on the create or join form → error message shown immediately, no navigation occurs. Enter "  Alice  " → stored as "Alice".

### Tests for User Story 1 (Write first, expect failure before implementation) ⚠️

- [ ] T001 [P] [US1] Write test for `createRoomSchema` and `joinRoomSchema` rejecting empty/whitespace-only playerName in `backend/src/api/schemas.test.ts`
- [ ] T002 [P] [US1] Write test for `displayName()` trimming leading/trailing whitespace in `backend/src/services/roomStore.test.ts`

### Implementation for User Story 1

- [ ] T003 [US1] Update Zod `createRoomSchema` and `joinRoomSchema` in `backend/src/api/schemas.ts` to validate playerName as `z.string().trim().min(1, "Player name is required")`
- [ ] T004 [US1] Update `displayName()` in `backend/src/services/roomStore.ts` to trim the input and skip the empty fallback (rely on Zod validation instead)
- [ ] T005 [US1] [P] Add client-side name trimming and validation to `frontend/src/pages/CreateRoomPage.tsx` — trim on submit, show error if empty after trim, display server validation errors
- [ ] T006 [US1] [P] Add client-side name trimming and validation to `frontend/src/pages/JoinRoomPage.tsx` — trim on submit, show error if empty after trim, display server validation errors

**Checkpoint**: At this point, blank/whitespace-only names are rejected on both frontend and backend. Names with leading/trailing whitespace are stored trimmed. This is a viable MVP increment.

---

## Phase 2: User Story 2 - First Round Begins with Host as Drawer (Priority: P1)

**Goal**: When the host starts the game from the lobby, round 1 begins. The host is assigned as the drawer, and all participants see who the drawer is. The drawer sees the secret word; guessers do not.

**Independent Test**: Host starts a game with 2+ participants → host's game screen shows "You are drawing!" + the secret word; guessers see "[host name] is drawing" without any secret word visible.

### Tests for User Story 2 (Write first, expect failure before implementation) ⚠️

- [ ] T007 [P] [US2] Write test for `startGame()` creating round 1 with correct drawerId and secretWord in `backend/src/services/roomStore.test.ts`
- [ ] T008 [P] [US2] Write test for `toRoomSnapshot()` including `secretWord` only when viewer is the drawer in `backend/src/services/roomStore.test.ts`
- [ ] T009 [P] [US2] Write test for `toRoomSnapshot()` excluding `secretWord` for non-drawer viewers in `backend/src/services/roomStore.test.ts`

### Implementation for User Story 2

- [ ] T010 [US2] Create `Round` interface and add `currentRound` field to `Room` in `backend/src/models/game.ts`
- [ ] T011 [US2] Add `drawerId` and `secretWord` (optional) fields to `RoomSnapshot` in `backend/src/models/game.ts`
- [ ] T012 [US2] Implement deterministic `selectWord(roomCode: string, roundNumber: number): string` in `backend/src/services/roomStore.ts` — uses `sum(charCodes of roomCode) % wordList.length`
- [ ] T013 [US2] Update `startGame()` in `backend/src/services/roomStore.ts` to create a Round object (number=1, drawerId=hostId, word=selectWord(), status=in_progress) and assign it to `room.currentRound` on status transition
- [ ] T014 [US2] Update `toRoomSnapshot()` in `backend/src/services/roomStore.ts` to include `drawerId` for all viewers and `secretWord` only when `viewerParticipantId === drawerId`
- [ ] T015 [US2] [P] Update `RoomSnapshot` type in `frontend/src/services/api.ts` to include `drawerId: string | null` and `secretWord?: string`
- [ ] T016 [US2] Update `frontend/src/pages/GamePage.tsx` to use `drawerId` and `participantId` for drawer identification — show "You are drawing!" + secret word for drawer, show "[Name] is drawing" for guessers without the word

**Checkpoint**: At this point, the full first-round flow works: host starts game → drawer sees word → guessers see who is drawing but not the word.

---

## Phase 3: User Story 3 - Secret Word is Deterministically Selected (Priority: P2)

**Goal**: The secret word for round 1 is always the same for a given room code, and the selection cycles through the word list as round numbers increase.

**Independent Test**: Given the same room code across two separate game sessions (or server restarts), round 1 selects the same word.

### Tests for User Story 3 (Write first, expect failure before implementation) ⚠️

- [ ] T017 [P] [US3] Write test for `selectWord()` returning the same word for the same room code in `backend/src/services/roomStore.test.ts`
- [ ] T018 [P] [US3] Write test for `selectWord()` cycling through the word list when round number exceeds list length in `backend/src/services/roomStore.test.ts`

### Implementation for User Story 3

- [ ] T019 [US3] Add word list cycling in `selectWord()` in `backend/src/services/roomStore.ts` — round numbers beyond list length wrap via modulo

**Checkpoint**: Word selection is verifiably deterministic — same room code always produces the same word for round 1 and word list cycles for subsequent rounds.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final verification.

- [ ] T020 Run through `quickstart.md` verification steps to confirm full end-to-end flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **US1 (Phase 1)**: No dependencies — can start immediately (self-contained validation changes)
- **US2 (Phase 2)**: Depends on model changes (T010, T011) before business logic (T012-T014). Frontend tasks (T015, T016) can proceed after T010-T011.
- **US3 (Phase 3)**: Depends on T012 (selectWord) from US2
- **Polish (Phase 4)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Fully independent — no dependency on other stories
- **US2 (P1)**: No code dependency on US1 (different files) — can be implemented in parallel with US1
- **US3 (P2)**: Depends on `selectWord()` from US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Backend before frontend
- Story complete before moving to next phase

### Parallel Opportunities

- T001 and T002 (US1 backend tests) can run in parallel
- T005 and T006 (US1 frontend validation) can run in parallel
- T007, T008, T009 (US2 backend tests) can run in parallel
- T010 and T011 (US2 model extensions) can run in parallel
- T015 (frontend types) can run in parallel with T012-T014 (backend logic)
- T017 and T018 (US3 tests) can run in parallel
- US1 and US2 can be implemented in parallel by different developers (different files)

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Write test for startGame creating round 1"
Task: "Write test for toRoomSnapshot drawer-only secretWord"
Task: "Write test for toRoomSnapshot guesser word exclusion"

# Launch all model tasks for User Story 2 together:
Task: "Create Round type and currentRound in backend/src/models/game.ts"
Task: "Add drawerId and secretWord to RoomSnapshot in backend/src/models/game.ts"

# Launch frontend type updates in parallel with backend logic:
Task: "Update RoomSnapshot type in frontend/src/services/api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Write tests for US1 (T001-T002) — expect them to fail
2. Implement US1 (T003-T006) — make tests pass
3. **STOP and VALIDATE**: Empty/whitespace names rejected, names trimmed on input
4. Deploy/demo validation improvements

### Incremental Delivery

1. Add US1 (name validation) → Test independently → MVP complete
2. Add US2 (first round with drawer) → Test independently → Core game loop functional
3. Add US3 (deterministic word selection) → Test independently → Full spec complete

### Parallel Team Strategy

With multiple developers:

1. Developer A: US1 (name validation) — fully independent
2. Developer B: US2 (first round) — independent code paths from US1
3. Start US3 after US2 foundational tasks (T012) complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
