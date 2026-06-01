# Discovery Notes — Scribble Starter

## Missing Behaviors

**No `.env` or `.env.example` file.** The frontend reads `VITE_API_URL` with a fallback to `http://localhost:3001` (`frontend/src/services/api.ts:22`), but no `.env` or `.env.example` file is provided to document this configuration variable. Developers have no discoverable way to know they can point the frontend at a different backend URL without reading the source.

**No minimum player check before starting.** The lobby has no guard preventing the game from starting with only one player. The "Start Game" button in `LobbyPage.tsx:50` is always enabled regardless of how many participants are in the room.

**No player name validation.** Both `createRoomSchema` and `joinRoomSchema` define `playerName` as `z.string().optional()` (`backend/src/api/schemas.ts:5,8`). When the field is empty or whitespace-only, `displayName()` defaults it to "Player" silently (`backend/src/services/roomStore.ts:34`). The create and join forms (`frontend/src/pages/CreateRoomPage.tsx`, `frontend/src/pages/JoinRoomPage.tsx`) also accept empty submissions — there is no frontend-side trim or required check.

**No explicit host tracking.** The room creator is always the first entry in `participants[]` (`backend/src/services/roomStore.ts:42-49`), but there is no `isHost` field on the `Participant` type (`backend/src/models/game.ts:8-12`). Any host-dependent logic would need to infer ownership by array position, which is fragile.

**`viewerParticipantId` is discarded.** The `toRoomSnapshot` function receives `viewerParticipantId` from the API layer but explicitly ignores it with `void viewerParticipantId` (`backend/src/services/roomStore.ts:70`). The room snapshot returned is identical for every viewer, making per-viewer filtering (e.g., hiding a secret word from guessers) impossible without reworking this function.

**State is lost on page refresh.** After creating or joining a room and landing on the lobby, a browser refresh sets `room` to `null` in the store, causing `LobbyPage.tsx:14` to redirect back to `/`. The room session exists only in React memory (`frontend/src/state/roomStore.ts`) with no URL-based or persisted recovery mechanism.

**"Start Game" is a client-side redirect with no backend interaction.** The button in `LobbyPage.tsx:52` calls `navigate("/game")` directly. There is no API request to transition the room status or initialize any game state on the backend.

**Guess form submit is a no-op.** `GuessForm.tsx:8-10` calls `preventDefault()` and returns without making any API call or state update. The form renders but is completely non-functional.

**No room code normalization on the backend.** The frontend uppercases the code before sending (`frontend/src/pages/JoinRoomPage.tsx:24-25`), but the backend routes — `POST /:code/join` and `GET /:code` in `backend/src/api/rooms.ts` — do not validate or normalize the code themselves. A direct API call with a lowercase code would fail to match.

**No way to leave the lobby.** Once a player creates or joins a room and lands on the lobby page, there is no "Back" or "Leave Room" button to return to the home screen. The only navigation option is "Start Game" which goes to the game page, and from there "Exit Game" goes back to the lobby — creating a dead-end loop (`frontend/src/pages/LobbyPage.tsx`, `frontend/src/pages/GamePage.tsx:69`).

## Assumptions

**Blank names are acceptable.** Defaulting an empty `playerName` to `"Player"` means multiple unnamed participants would all display identically with no way to tell them apart. (`backend/src/services/roomStore.ts:34`)

**First participant is implicitly the host.** There is no explicit `isHost` marker on `Participant`, so any host check must compare against `participants[0].id`. This is fragile if the participant list is ever reordered or if participants can be removed. (`backend/src/models/game.ts:8-12`, `backend/src/services/roomStore.ts:42-49`)

**All participants see the same snapshot.** Because `viewerParticipantId` is explicitly voided in `toRoomSnapshot` (`backend/src/services/roomStore.ts:70`), the function assumes that no participant needs different data. Future features like drawer-only word visibility will require this to change.

**Roles and words are static.** `availableWords` and `roles` in `RoomSnapshot` (`backend/src/services/roomStore.ts:72-73`) are identical for every request — the same starter word list and role array are returned regardless of room state. There is no round-specific word selection or per-participant role assignment.

**`RoomStatus` only needs "lobby".** The `RoomStatus` type (`backend/src/models/game.ts:3`) has a single value. Any game-progression logic (rounds, results) will require adding new status values, which cascades into `RoomSnapshot` and all consumers.

**No room cleanup is needed.** Rooms are stored forever once created. The only cleanup is on server restart. There is no TTL, max-age, or eviction for abandoned rooms. (`backend/src/services/roomStore.ts`)
