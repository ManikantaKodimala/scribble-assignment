# Quickstart: Room Setup & Lobby

Implementation order for this feature.

## Prerequisites

- Backend and frontend dev servers running (`npm run dev` in each)
- Two browser tabs for testing

## Implementation Sequence

### 1. Backend: Add hostId and isHost to room model

- Add `hostId` field to `Room` and `isHost` field to `Participant` in
  `backend/src/models/game.ts`
- Update `createRoom` in `backend/src/services/roomStore.ts` to set `hostId` and `isHost`
- Update `toRoomSnapshot` to include `hostId` and `isHost` in response
- **Test**: Run `npm test` in backend — existing tests pass, new behavior verified

### 2. Backend: Add start game endpoint

- Add `POST /rooms/:code/start` route in `backend/src/api/rooms.ts`
- Add `startGame` function in `backend/src/services/roomStore.ts`
  - Validate caller is host (403 if not)
  - Validate at least 2 participants (403 if not)
  - Transition room status from `"lobby"` to `"playing"`
- Add Zod schema for start game request body
- **Test**: Use curl or frontend to create room, join with second tab, start game

### 3. Frontend: Add pollError to room store

- Update `RoomState` interface in `frontend/src/state/roomStore.ts` to include `pollError`
- Update `fetchRoom` to handle errors gracefully and set `pollError`
- Reset `pollError` on successful poll

### 4. Frontend: Add auto-polling to lobby

- Update `LobbyPage.tsx` to use `useEffect` with `setInterval` (~2s) calling
  `roomStore.fetchRoom()`
- Clear interval on unmount
- On poll response with `status === "playing"`, auto-navigate to `/game`

### 5. Frontend: Add polling error indicator

- Show a subtle error banner when `pollError` is set
- Hide banner on successful subsequent poll

### 6. Frontend: Host-only start game button

- Update `LobbyPage.tsx` to check `isHost` before showing enabled "Start Game" button
- Disable button when participants < 2
- Call `api.startGame()` on click instead of direct navigation
- Read updated room status from response; navigate to `/game` on success

### 7. Frontend: Add startGame API function

- Add `startGame(code, participantId)` to `frontend/src/services/api.ts`

### 8. Verification

- Create room in Tab A → lobby shown with code
- Join with Tab B → both tabs show 2 participants within ~2s
- Non-host tab shows disabled start button
- Host tab shows enabled start button once 2 players present
- Host clicks start → both tabs navigate to game screen
- Test invalid codes, empty codes, non-existent codes produce correct errors
