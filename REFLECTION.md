# Reflection Report

## What did the starter app already have?

The starter app provided:

- **Express + TypeScript backend** with in-memory room management (`Map<string, Room>`), Zod validation for request schemas, and centralized error handling
- **React 18 + Vite frontend** with React Router v6, a custom class-based RoomStore with `useSyncExternalStore` subscription pattern, and CSS-based styling
- **Full game loop**: room creation/join, lobby with player list, game start with drawer assignment and deterministic word selection, guess submission with case-insensitive matching, and score tracking (+100 per correct guess)
- **Polling infrastructure**: LobbyPage polls `GET /rooms/:code` every 2 seconds, and redirects to `/game` when `room.status` changes to `"playing"` — but the GamePage itself had **no polling**
- **Placeholder components**: `Scoreboard` showed hardcoded "Waiting for players..." text, and `ResultPanel` was dead code never used in any page
- **Round lifecycle**: rounds transition from `in_progress` to `completed` when all guessers solve, but there was no mechanism to advance to the next round, end the game, or show results
- **Secret word visibility**: only the drawer could see the secret word — even after the round completed, non-drawers never saw it

## What did you add?

- **Results screen (ResultsPage)**: automatically appears for all players when a round completes. Shows the secret word (now revealed to everyone), final scores sorted by points, and the full guess history with correct/incorrect markers
- **GamePage polling**: added 2-second polling to the GamePage so it can detect when the round ends and auto-navigate to `/results`
- **Restart mechanism**: new `POST /api/rooms/:code/restart` endpoint (host-only) that resets scores, clears the current round, and returns the room to `lobby` status while preserving the participant list
- **Restart button**: host sees "Restart Game" on the results page; non-hosts see "Waiting for host to start next game..."
- **Restart detection**: ResultsPage polls and automatically navigates back to `/lobby` when it detects `room.status` has changed to `"lobby"`
- **Scoreboard fix**: replaced the hardcoded placeholder with real score rendering (sorted descending, player name + points)
- **Spec artifacts**: complete spec, plan, research, data model, contracts, quickstart, and task breakdown following the speckit workflow
- **CSS**: styles for results page layout, scoreboard list, and revealed secret word display
- **Backend regression cleanup**: removed unreachable `saveRoom` export, fixed `toRoomSnapshot` to use the local `roundComplete` variable instead of recomputing, and updated the `GamePage` to use proper routing redirects instead of hard navigation
