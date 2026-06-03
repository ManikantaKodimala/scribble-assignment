# Feature Specification: Room Setup & Lobby

**Feature Branch**: `001-room-setup-lobby`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "Room Setup & Lobby. Given a player wants to host or join a drawing game, When they create or join a room via a unique code, Then the creator is automatically the host; invalid/empty codes are rejected with clear feedback; rooms are fully isolated; the lobby refreshes via polling (~2s); and only the host can start the game once at least 2 players are present."

## Clarifications

### Session 2026-06-01

- Q: How do non-host participants discover the game has started? → A: Lobby polling detects the room status change (e.g., lobby → playing) and auto-navigates all participants to /game.
- Q: What should happen when a lobby poll request fails? → A: Show a subtle error banner or indicator in the lobby but continue polling on the next interval.
- Q: Should duplicate player names be allowed in the same room? → A: Allow duplicates — participant IDs are the real identifier; names are cosmetic labels.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Room (Priority: P1)

A player wants to host a drawing game. They enter a player name, the system generates a unique room code, and the player is designated as the room host. They are taken to the lobby where they can see their room code and wait for others to join.

**Why this priority**: Room creation is the entry point for the entire game. Without it, no game can start.

**Independent Test**: A single player can open the app, enter a name, click "Create Room", and see a room code displayed on the lobby screen with themselves listed as a participant.

**Acceptance Scenarios**:

1. **Given** a player has entered a valid player name, **When** they submit the create room form, **Then** a unique 4-character room code is generated, the player is marked as host, and they are taken to the lobby showing the room code and participant list.
2. **Given** a player has created a room and is on the lobby, **When** they view the screen, **Then** they see a room code badge, their own name in the participant list, and a "Start Game" button.
3. **Given** a player creates a room without providing a player name, **When** the room is created, **Then** they are assigned a default name of "Player" and are still designated as the host.

---

### User Story 2 - Join a Room (Priority: P1)

A player wants to join an existing drawing game. They enter a player name and a 4-character room code. The system validates the code, adds them to the room, and takes them to the lobby alongside the host and any other participants.

**Why this priority**: Joining is the second entry point. Without it, multiplayer is impossible.

**Independent Test**: A player can open the app, enter a name and a valid room code from another tab, click "Join", and see themselves appear in the lobby's participant list alongside the host.

**Acceptance Scenarios**:

1. **Given** a room exists with a valid code, **When** a player enters that code and a player name and submits the join form, **Then** they are added to the room's participant list and taken to the lobby.
2. **Given** a player enters an empty room code on the join form, **When** they submit, **Then** they see a clear error message ("Room code is required") and are not navigated to the lobby.
3. **Given** a player enters a room code that does not match any existing room, **When** they submit, **Then** they see a clear error message ("Room not found") and are not navigated to the lobby.
4. **Given** a player enters a valid room code but provides no player name, **When** they submit, **Then** they join the room with a default name of "Player" and are taken to the lobby.

---

### User Story 3 - Lobby Refresh and Game Start (Priority: P2)

Once in the lobby, players see the participant list update automatically. The host can start the game only when at least 2 players are present.

**Why this priority**: Auto-refresh improves user experience, and host-only start with a minimum player count is a game integrity requirement.

**Independent Test**: Two browser tabs can join the same room and see each other appear in the participant list within ~2 seconds. Only the host tab shows an enabled "Start Game" button once both players are present.

**Acceptance Scenarios**:

1. **Given** a room has at least one participant, **When** a new player joins the room, **Then** all participants in the lobby see the updated participant list within approximately 2 seconds without manual refresh.
2. **Given** a room has only one participant (the host), **When** the host views the lobby, **Then** the "Start Game" button is disabled.
3. **Given** a room has at least 2 participants, **When** a non-host participant views the lobby, **Then** they do not see an enabled "Start Game" button.
4. **Given** a room has at least 2 participants, **When** the host clicks "Start Game", **Then** the room status changes from lobby to playing and the next lobby poll response returns the updated status, causing all participants' browsers to auto-navigate to the game screen.

---

### Edge Cases

- What happens when a player enters a room code with leading/trailing whitespace? Codes should be trimmed and uppercased before matching.
- What happens when multiple rooms are active simultaneously? Participants in one room must never see data from another room.
- What happens if a participant leaves the lobby (closes tab)? The participant remains in the room for the current session; stale participants are not removed.
- What happens if the host leaves? The feature does not specify host transfer; the room continues with the original host. If the host's tab is closed, the "Start Game" button is unavailable.
- What happens when a lobby poll request fails due to a network error or server error? A subtle error indicator is shown in the lobby, but polling continues on the next interval automatically.
- What happens if two participants join with the same display name? Duplicate names are allowed — participants are distinguished by their unique IDs internally, and no uniqueness check is enforced on names.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate a unique 4-character alphanumeric room code when a room is created.
- **FR-002**: System MUST designate the room creator as the host with a host-specific permission flag.
- **FR-003**: System MUST reject join requests with an empty room code and return a clear error message.
- **FR-004**: System MUST reject join requests for non-existent room codes and return a clear "Room not found" error.
- **FR-005**: System MUST trim and uppercase room codes before validation and matching.
- **FR-006**: System MUST add a joining player to the room's participant list on successful join.
- **FR-007**: System MUST return the current participant list and current room status when the lobby is polled.
- **FR-008**: Lobby MUST auto-refresh the participant list at approximately 2-second intervals.
- **FR-009**: The "Start Game" action MUST be restricted to the host participant only.
- **FR-010**: The "Start Game" action MUST require at least 2 participants in the room.
- **FR-011**: System MUST keep room data completely isolated — participants in one room must never see participants, codes, or state from another room.
- **FR-012**: When the lobby poll detects a room status of "playing", the frontend MUST auto-navigate all participants from the lobby to the game screen without a manual action.
- **FR-013**: When a lobby poll request fails, the frontend MUST display a subtle error indicator and continue polling on the next scheduled interval.

### Key Entities *(include if feature involves data)*

- **Room**: Represents a game session. Contains a unique code, room status, participant list, and host identifier. Created when a player uses the create room flow.
- **Participant**: Represents a player in a room. Has a display name, a unique participant ID, and a host flag indicating whether they created the room.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can create a room and see the lobby with their room code in under 3 seconds.
- **SC-002**: A second player can join the same room using the 4-character code and appear in the host's lobby within 2 seconds of polling.
- **SC-003**: Invalid room codes (empty, non-existent) produce a clear error message within 1 second.
- **SC-004**: Two independent rooms can operate simultaneously with no cross-room data leakage — participants in room A never see room B's data.
- **SC-005**: The "Start Game" button is disabled for non-host players and for hosts when fewer than 2 participants are present.

## Assumptions

- Player names are optional; empty names default to "Player". The feature description does not require name validation changes.
- Room codes are 4-character alphanumeric using an unambiguous alphabet (no 0/O, 1/I/L to avoid confusion).
- "Start Game" transitions the room to a new state but the details of that state (rounds, drawer assignment) are handled by a subsequent feature.
- Stale participants (closed tabs) remain in the room's participant list; there is no timeout-based removal.
- All participants start with a score of 0 when the room is created, but scoring is tracked by a future feature.
- The lobby auto-polling stops once the game starts; the game screen has its own polling mechanism.
