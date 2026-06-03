# Feature Specification: First Round Start

**Feature Branch**: `002-first-round-start`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "Given a game is starting and player names are trimmed (empty/whitespace-only rejected with a message), When the first round begins, Then the host (or first player) becomes the clearly-identified drawer, and the secret word (deterministically selected from the starter list) is visible only to the drawer."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Player Name Validation (Priority: P1)

When a player enters a room (create or join), their name is trimmed of whitespace. If the result is empty, they see a clear error and are not admitted.

**Why this priority**: Invalid names must be caught before the game starts, or they break drawer identification and general UX.

**Independent Test**: A player can enter whitespace-only or blank name on the create/join form and see an error message without being navigated away from the form.

**Acceptance Scenarios**:

1. **Given** a player enters a name with leading/trailing whitespace (e.g., "  Alice  "), **When** they submit the create or join form, **Then** the name is stored as "Alice" (trimmed).
2. **Given** a player enters a name consisting only of whitespace (e.g., "   "), **When** they submit, **Then** they see a clear error message ("Player name is required") and remain on the current page.
3. **Given** a player leaves the name field empty, **When** they submit, **Then** they see a clear error message ("Player name is required") and remain on the current page.

---

### User Story 2 - First Round Begins with Host as Drawer (Priority: P1)

When the host starts the game from the lobby, the first round begins. The host is assigned as the drawer and all participants see who is drawing.

**Why this priority**: Round start is the core of the feature — without it, the game cannot proceed from lobby to gameplay.

**Independent Test**: After the host clicks "Start Game", both the host and other participants see a game screen where the host is labeled as the drawer, and the drawer's screen shows the secret word.

**Acceptance Scenarios**:

1. **Given** a room with 2+ participants and the host clicks "Start Game", **When** the next lobby poll returns the "playing" status, **Then** the host's game screen identifies them as the drawer (e.g., "You are drawing!" badge) and other participants' screens show the host's name as the drawer (e.g., "Alice is drawing").
2. **Given** the first round has started, **When** the drawer views their game screen, **Then** the secret word is displayed prominently.
3. **Given** the first round has started, **When** a non-drawer participant views their game screen, **Then** they do not see the secret word — that area shows a placeholder such as "Round in progress" or a guess prompt.

---

### User Story 3 - Secret Word is Deterministically Selected (Priority: P2)

The secret word for each round is chosen from the starter list using a deterministic algorithm so that the same room and round inputs always produce the same word.

**Why this priority**: Deterministic selection ensures consistency and predictability — a room with a given code will always start with the same word, which aids debugging and replay.

**Independent Test**: Given the same room code, the same word is always chosen for round 1 across separate test runs.

**Acceptance Scenarios**:

1. **Given** a room code and round number, **When** round 1 starts, **Then** the word selected is deterministically derived from the room code and round number.
2. **Given** the same room code is used in a new game session, **When** round 1 starts, **Then** the same word is selected as in previous sessions.

---

### Edge Cases

- What happens if the drawer's name was trimmed to an empty string? This is prevented by FR-001/FR-002 — names are validated before the game starts.
- What happens if a player joins after round 1 has started? Out of scope — join is only allowed during "lobby" status.
- What happens if the starter word list contains duplicate entries? The deterministic selection may pick a word that appears multiple times, but functionally the same word is shown.
- What happens when the starter word list is exhausted across multiple rounds? The deterministic algorithm wraps around via modulo, cycling through the list.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Player names MUST be trimmed of leading and trailing whitespace before storage or display.
- **FR-002**: Player names that are empty or contain only whitespace after trimming MUST be rejected with a clear, user-facing error message. The player remains on the create/join form.
- **FR-003**: When a room transitions from "lobby" to "playing" status, the host participant MUST be assigned as the drawer for round 1.
- **FR-004**: All participants MUST be able to identify who the current drawer is via a clear visual indicator on the game screen (e.g., a badge, label, or distinct styling).
- **FR-005**: A secret word MUST be selected from the starter word list when round 1 begins. The selection MUST be deterministic — the same room code and round number always produce the same word.
- **FR-006**: The drawer's game screen MUST display the secret word so the drawer can reference it.
- **FR-007**: Non-drawer participants MUST NOT see the secret word in any API response or rendered UI. The word may only exist server-side and in the drawer's client view.

### Key Entities *(include if feature involves data)*

- **Round**: A single drawing round within a game session. Attributes: round number, drawer participant ID, secret word, status (in_progress / completed). A room in "playing" status has at least one round.
- **Drawer**: The participant responsible for drawing in a given round. For round 1, this is always the host participant. Identified by a drawer reference scoped to the round.
- **Secret Word**: A word from the starter word list (a fixed, finite collection), assigned to a specific round via deterministic selection. Only the drawer may see it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player submitting a blank or whitespace-only name sees an error message on screen within 1 second and is not navigated to any other page.
- **SC-002**: When the host starts the game, all participants see the game screen with the drawer identified within 2 seconds of the next lobby poll.
- **SC-003**: The drawer's screen displays the secret word in an area that non-drawer participants cannot access — the word does not appear in any API payload sent to guessers.
- **SC-004**: Given the same room code, round 1 always selects the same word across separate game sessions (determinism verified via two independent tests with the same room code).

## Assumptions

- Name validation applies to both the create room flow and the join room flow equally.
- The existing "Start Game" action (from the Room Setup & Lobby feature) transitions the room to "playing" status, which is the trigger for round creation and drawer assignment.
- The starter word list is a fixed array (the existing 5 words: rocket, pizza, castle, guitar, sunflower). For subsequent rounds the list may be extended, but determinism uses whatever list is active at the time of round creation.
- Deterministic selection uses a simple integer derivation from the room code (e.g., summing character codes) modulo the word list length. Round numbers beyond list length wrap around via the same modulo.
- Participants cannot join a room after the game has started (status is "playing"); join is only allowed during "lobby" status.
- The participant model (from the Room Setup & Lobby feature) already supports unique participant IDs, host flags, and display names.
