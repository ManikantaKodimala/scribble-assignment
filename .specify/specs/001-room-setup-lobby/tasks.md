# Tasks: Room Setup & Lobby

**Input**: Design documents from `.specify/specs/001-room-setup-lobby/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Only include test tasks if explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths are relative to the repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No additional setup required — project already initialized and running.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core model and type changes that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Add `isHost` field to `Participant` and `hostId` field to `Room` in `backend/src/models/game.ts`
- [X] T002 [P] Add `status` field (union `"lobby" | "playing"`) to `RoomSnapshot` in `backend/src/models/game.ts`
- [X] T003 Update `createRoom` and `joinRoom` in `backend/src/services/roomStore.ts` to set `hostId` (on create) and `isHost` (true for creator, false for joiners), and include `status` in the response
- [X] T004 [P] Update `toRoomSnapshot` to include `hostId`, `isHost`, and `status` in `backend/src/services/roomStore.ts`
- [X] T005 [P] Add room code validation schemas in `backend/src/api/schemas.ts` — empty string rejection, trim + uppercase normalization
- [X] T006 Update `POST /:code/join` and `GET /:code` in `backend/src/api/rooms.ts` to normalize codes (trim, uppercase) and return specific error messages for empty vs non-existent codes
- [X] T007 [P] Update frontend types in `frontend/src/services/api.ts` — add `status`, `hostId`, `isHost` to `RoomSnapshot` and `Participant` interfaces
- [X] T008 Add `pollError` field to `RoomState` in `frontend/src/state/roomStore.ts` and update `fetchRoom` to catch errors and set `pollError` instead of `error`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel if desired.

---

## Phase 3: User Story 1 - Create a Room (Priority: P1) 🎯 MVP

**Goal**: A player creates a room, is designated as host, and lands in the lobby with a room code.

**Independent Test**: A single player can open the app, enter a name, click "Create Room", and see their room code displayed on the lobby screen with themselves listed as a participant marked as host.

**Note**: The create-room flow already exists in the starter. Foundational tasks T001–T008 cover the backend changes. The following task verifies the frontend displays the new host information correctly.

### Implementation for User Story 1

- [X] T009 [US1] Update `CreateRoomPage.tsx` and `JoinRoomPage.tsx` in `frontend/src/pages/` to display host designation and room status in the lobby

**Checkpoint**: User Story 1 should be fully functional and testable independently — a single player can create a room and see host status.

---

## Phase 4: User Story 2 - Join a Room (Priority: P1)

**Goal**: A player joins an existing room using a 4-character code, with clear error messages for empty or invalid codes.

**Independent Test**: A player can open the app, enter a name and a valid room code, click "Join", and appear in the lobby's participant list. Empty codes show an error. Non-existent codes show "Room not found."

### Implementation for User Story 2

- [X] T010 [US2] Update `frontend/src/pages/JoinRoomPage.tsx` to display backend error messages for empty codes ("Room code is required") and non-existent codes ("Room not found")
- [X] T011 [US2] Add frontend-side validation in `frontend/src/pages/JoinRoomPage.tsx` to prevent submission of empty room codes before the API call

**Checkpoint**: User Stories 1 AND 2 should both work independently — players can create and join rooms with proper error feedback.

---

## Phase 5: User Story 3 - Lobby Refresh and Game Start (Priority: P2)

**Goal**: The lobby auto-refreshes via polling. Only the host can start the game with 2+ players. Non-host players auto-navigate to the game screen when the game starts.

**Independent Test**: Two browser tabs join the same room and see each other within ~2s. Only the host's "Start Game" button is enabled when 2+ players are present. Clicking it navigates both tabs to the game screen.

### Implementation for User Story 3

- [X] T012 [P] [US3] Add auto-polling with `setInterval` (~2s) in `frontend/src/pages/LobbyPage.tsx` calling `roomStore.fetchRoom()` — clear interval on unmount
- [X] T013 [US3] Create `LobbyStatus.tsx` component in `frontend/src/components/` to display a subtle error banner when `pollError` is set, hiding it on successful subsequent poll
- [X] T014 [P] [US3] Add `startGame` function in `frontend/src/services/api.ts` — `POST /rooms/:code/start` with `participantId` in body
- [X] T015 [US3] Implement `startGame` endpoint in `backend/src/api/rooms.ts` — validate caller is host (403), validate 2+ participants (403), transition room status from `"lobby"` to `"playing"`
- [X] T016 [P] [US3] Add `startGame` function in `backend/src/services/roomStore.ts` — host check, minimum player check, status transition, return updated room
- [X] T017 [US3] Update `frontend/src/pages/LobbyPage.tsx` — disable "Start Game" for non-hosts and when fewer than 2 participants; on host click, call `api.startGame()` and navigate to `/game` on success
- [X] T018 [US3] Add auto-navigation in `frontend/src/pages/LobbyPage.tsx` — when poll response returns `status: "playing"`, navigate to `/game`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [X] T019 [P] Update `backend/src/services/roomStore.ts` to remove `void viewerParticipantId` — pass it through for future per-viewer filtering
- [X] T020 Backend tests — run `npm test` in `backend/` to verify existing tests still pass
- [X] T021 Frontend tests — run `npm test` in `frontend/` to verify existing tests still pass
- [ ] T022 Manual end-to-end verification with two browser tabs per quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — already complete
- **Foundational (Phase 2)**: No dependencies — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational completion
- **US2 (Phase 4)**: Depends on Foundational completion — can run in parallel with US1
- **US3 (Phase 5)**: Depends on Foundational + US1 + US2 completion
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependencies on other stories
- **US2 (P1)**: Can start after Foundational — no dependencies on other stories
- **US3 (P2)**: Depends on US1 + US2 (needs room with participants)

### Within Each User Story

- Models/type changes before services
- Services before endpoints
- Backend before frontend integration
- Core implementation before integration

### Parallel Opportunities

- T001, T002, T004, T005, T007 can run in parallel (Phase 2)
- US1 and US2 can run in parallel after Phase 2
- T012, T014, T016 can run in parallel (Phase 5)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational
2. Complete Phase 3: User Story 1
3. **STOP and VALIDATE**: Test US1 independently (create room, see host badge, see lobby)
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add US1 → Test independently → Deploy/Demo (MVP with room creation!)
3. Add US2 → Test independently → Deploy/Demo (joining works!)
4. Add US3 → Test independently → Deploy/Demo (full lobby experience!)

---

## Notes

- [P] tasks = different files, no dependencies
- US1 + US2 are both P1 and can be implemented in any order
- US3 is P2 and depends on rooms having participants (US1 + US2)
- Each user story should be independently testable per the criteria listed above
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tests: The spec does not request explicit test tasks; testing is covered by manual verification in T020–T022
