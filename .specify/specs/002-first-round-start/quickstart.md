# Quickstart: First Round Start

Implementation order for this feature.

## Prerequisites

- Feature 001 (Room Setup & Lobby) fully implemented
- Backend and frontend dev servers running (`npm run dev` in each)
- Two browser tabs for testing

## Implementation Sequence

### 1. Backend: Add Round type and extend Room model

- Add `Round` interface to `backend/src/models/game.ts`
- Add `currentRound` field to `Room`
- Add `drawerId` and `secretWord` (optional) to `RoomSnapshot`

### 2. Backend: Add word selection utility

- Add `selectWord(roomCode: string, roundNumber: number): string` to `roomStore.ts`
- Deterministic algorithm: `sum(charCodes of roomCode) % wordList.length`

### 3. Backend: Validate player names (trim + reject empty)

- Update `createRoomSchema` and `joinRoomSchema` in `schemas.ts`:
  - `z.string().trim().min(1, "Player name is required")`
- Update `displayName()` in `roomStore.ts` to trim and reject empty
- Add validation error handling in route handlers

### 4. Backend: Create round 1 on startGame

- Update `startGame()` in `roomStore.ts`:
  - After transitioning status to `"playing"`, create a `Round` object:
    - `number: 1`, `drawerId: room.hostId`, `secretWord: selectWord(room.code, 1)`, `status: "in_progress"`
  - Assign it to `room.currentRound`

### 5. Backend: Filter secretWord in toRoomSnapshot

- Update `toRoomSnapshot()`:
  - Always include `drawerId` (from `room.currentRound.drawerId` or `null`)
  - Include `secretWord` only when `viewerParticipantId === drawerId`
  - Omit `secretWord` for all other viewers

### 6. Frontend: Update RoomSnapshot types

- Add `drawerId: string | null` and `secretWord?: string` to `RoomSnapshot` in `api.ts`

### 7. Frontend: Update GamePage for drawer identification

- Use `drawerId` and `participantId` to determine if the viewer is the drawer
- If viewer is the drawer: show "You are drawing!" badge and display the `secretWord`
- If viewer is a guesser: show "[Name] is drawing" with the drawer's name and hide the word

### 8. Frontend: Add client-side name validation

- Update `CreateRoomPage.tsx` and `JoinRoomPage.tsx`:
  - Trim input on submit
  - Client-side check: if empty after trim, show error without calling API
  - Display server errors from API (400 on empty/whitespace names)

### 9. Verification

- Submit empty name on create room → error message shown, not navigated
- Submit whitespace-only name on join room → error message shown, not navigated
- Submit trimmed name ("  Alice  ") → stored as "Alice"
- Host starts game → host sees "You are drawing!" + secret word
- Guesser sees "[Host name] is drawing" without the secret word
- Poll response does not include secretWord for non-drawer viewers
- Same room code always produces the same word in round 1 (test via server restart or new session)
