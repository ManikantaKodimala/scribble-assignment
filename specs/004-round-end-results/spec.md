# Feature Specification: Round End Results & Restart

**Created**: 2026-06-03

**Status**: Draft

**Input**: Given a round has ended, When the result state is displayed and the host restarts, Then all players see the correct word, final scores, and full guess history; on restart, everyone returns to the lobby with players preserved and all round state cleared.

## User Scenarios & Testing

### User Story 1 - All Players View Round-End Results (Priority: P1)

When a drawing round ends (all guessers have solved the word), all players automatically see a results screen showing the correct word, final scores for the round, and the complete guess history for that round.

**Why this priority**: Players need closure on each round — they want to see the answer, how they performed, and what others guessed. Without this, the game feels incomplete after each round.

**Independent Test**: After a round ends, every player in the room sees the correct word, their score, and a list of all guesses from the round. No action is required from any player to see these results.

**Acceptance Scenarios**:

1. **Given** a round has ended, **When** the results screen is displayed, **Then** all players see the secret word revealed.
2. **Given** a round has ended, **When** the results screen is displayed, **Then** all players see the final scores for that round (who scored and how many points).
3. **Given** a round has ended, **When** the results screen is displayed, **Then** all players see the full guess history (all guesses with submitter names and correct/incorrect markers) for the completed round.
4. **Given** a round has ended and the results screen is shown, **When** a player views the results, **Then** they see a "Waiting for host to start next game" message if the host has not yet acted.

---

### User Story 2 - Host Restarts the Game (Priority: P1)

The host sees a "Restart Game" or "Back to Lobby" option on the results screen. When they activate it, all players are returned to the lobby. All players are preserved in the lobby roster, but all round-specific state (scores, guesses, current round) is cleared.

**Why this priority**: The host must be able to drive game flow. Without the ability to restart, players would be stuck on the results screen indefinitely.

**Independent Test**: The host clicks a restart button in the results view. All players in the room are redirected to the lobby, still listed as participants, with scores reset to zero and no active round.

**Acceptance Scenarios**:

1. **Given** the results screen is displayed and I am the host, **When** I click "Restart Game", **Then** all players (including me) are taken to the lobby.
2. **Given** the results screen is displayed and I am NOT the host, **When** I look for a restart option, **Then** I do not see a restart button (only host can restart).
3. **Given** the host has restarted the game, **When** I arrive in the lobby, **Then** I see all participants who were in the game still present.
4. **Given** the host has restarted the game, **When** I arrive in the lobby, **Then** all scores are reset to zero and no round is active.

---

### Edge Cases

- What happens if the host disconnects or leaves before restarting? (Another participant should auto-promote to host per existing lobby mechanics; they can then restart.)
- What happens if only one player is left in the room when results are shown? (A restart should still return them to the lobby, but starting a new game may require at least 2 players.)
- What happens if a new player joins while results are displayed? (They should see the results screen showing the completed round's data.)
- What happens if all players leave the room during results? (The room should be cleaned up after a timeout, consistent with existing room cleanup behavior.)

## Requirements

### Functional Requirements

- **FR-001**: The system MUST automatically display a results screen to all players when a round ends.
- **FR-002**: The results screen MUST reveal the secret word for the completed round.
- **FR-003**: The results screen MUST show final scores (player names and cumulative points) for the completed round.
- **FR-004**: The results screen MUST show the full guess history for the completed round, including submitter names, guess text, and correct/incorrect status.
- **FR-005**: The host MUST see a "Restart Game" button on the results screen.
- **FR-006**: Non-host players MUST NOT see a restart button on the results screen.
- **FR-007**: When the host clicks "Restart Game", all players MUST be redirected to the lobby.
- **FR-008**: After restart, all participants from the completed game MUST remain in the lobby.
- **FR-009**: After restart, all round-specific state (current round, scores, guesses) MUST be cleared.
- **FR-010**: The results screen MUST update for all players via the existing polling mechanism (no WebSockets).

### Key Entities

- **Round Results**: A snapshot of a completed round containing the secret word, final scores, and guess history. Displayed to all players when a round ends and cleared on restart.
- **Restart Action**: A host-initiated action that returns all players to the lobby and clears round state while preserving the participant list.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All players see the results screen within 3 seconds of a round ending.
- **SC-002**: The host can restart the game with a single click and all players arrive in the lobby within 3 seconds.
- **SC-003**: After restart, all participants who were in the game are present in the lobby.
- **SC-004**: After restart, scores are reset to zero for all players.
- **SC-005**: Non-host players do not see any restart control on the results screen.

## Assumptions

- The existing room polling mechanism (fetchRoom every 2 seconds) is used for results sync and restart notification.
- The host is determined by the existing room host logic (first participant to join, or auto-promoted on leave).
- Restarting clears scores and round data but preserves the room code and participant list.
- Results show cumulative scores for the game session (across all completed rounds). Restart resets all scores to zero.
- Drawing canvas state is cleared on restart as part of "round state cleared".
- At least 2 participants are required to start a new game after restart (consistent with existing game start rules).
