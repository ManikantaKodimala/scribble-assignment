# Quickstart: Round End Results & Restart

## Files Changed

### Backend
| File | Change |
|---|---|
| `backend/src/services/roomStore.ts` | Add `restartGame()` function; expose it; update `toRoomSnapshot` to reveal secret word when `roundComplete` |
| `backend/src/api/schemas.ts` | No changes needed (reuse `startGameBodySchema` for `participantId`) |
| `backend/src/api/rooms.ts` | Add `POST /:code/restart` route |
| `backend/src/services/roomStore.test.ts` | Add tests for `restartGame`, update snapshot tests |

### Frontend
| File | Change |
|---|---|
| `frontend/src/services/api.ts` | Add `restartGame()` method |
| `frontend/src/state/roomStore.ts` | Add `restartGame()` and `restartPolling()` methods (or integrate with existing) |
| `frontend/src/pages/GamePage.tsx` | Add polling; redirect to `/results` on `roundComplete` |
| `frontend/src/pages/ResultsPage.tsx` | **New** — results display page |
| `frontend/src/pages/LobbyPage.tsx` | No changes (already polls; waiting on restart) |
| `frontend/src/routes/index.tsx` | Add `/results` route |
| `frontend/src/components/Scoreboard.tsx` | Fix to render `room.scores` instead of placeholder |

## Implementation Order

1. **Backend**: Add `restartGame()` to roomStore, update `toRoomSnapshot`, add REST endpoint
2. **Backend Tests**: `restartGame`, snapshot secret word reveal
3. **Frontend API**: Add `restartGame` to api.ts
4. **Frontend Store**: Add `restartGame` method to RoomStore
5. **Frontend ResultsPage**: New page with results display
6. **Frontend GamePage**: Add polling + redirect to results
7. **Frontend Routes**: Add `/results` route
8. **Frontend Scoreboard**: Fix to render real scores
9. **End-to-end verification**: Two-tab browser test
