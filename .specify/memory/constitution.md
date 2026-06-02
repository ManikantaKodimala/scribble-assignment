<!--
  Sync Impact Report
  Version change: (none) → 1.0.0
  New constitution — all sections populated from template.
  Added sections: 5 Core Principles, Technology Constraints, Spec Kit Workflow, Governance.
  Removed sections: none.
  Templates requiring updates: none (all are generic).
-->

# Scribble Constitution

## Core Principles

### I. TypeScript Strictness

All code MUST be fully typed. `any` is forbidden; use `unknown` for truly dynamic types. New
types MUST be declared for all function signatures, API payloads, and state shapes. Prefer
immutable data structures and pure functions.

### II. Stateless Server

All game state MUST live in-memory only. No database, no persistent storage, no WebSockets,
and no authentication. HTTP polling is the only sync mechanism. Restarting the server clears
all state. Room cleanup (TTL/eviction) MUST be explicitly implemented — implicit memory
leaks are unacceptable.

### III. Spec-First Development

Every feature MUST begin with a spec artifact documenting acceptance criteria and edge cases.
Implementation MUST NOT start before the spec is approved. The required order is:
Discovery → Specify → Clarify → Plan → Tasks → Implement → Validate. Code MUST match the
spec; any deviation MUST be documented with rationale.

### IV. Edge Case Rigor

All input boundaries MUST be validated — empty strings, whitespace-only, null, and
out-of-range values MUST produce specific error messages. Multi-room isolation MUST be
explicitly tested. Case-insensitive comparison MUST be used for guess matching. Every
endpoint MUST handle missing resources with distinguishable error codes.

### V. Brownfield Discipline

Work within the existing file structure and conventions. Do NOT rewrite from scratch. Do NOT
add new state-management or routing libraries beyond what the starter ships. Prefer small,
targeted edits over large refactors. Follow established patterns for components, services,
and API routes.

## Technology Constraints

- **Backend**: Node.js + Express + TypeScript, validated via Zod, executed via tsx.
- **Frontend**: Vite + React 18 + React Router v6, styled via plain CSS.
- **Testing**: Vitest for both backend (node environment) and frontend (jsdom environment).
- **Forbidden**: WebSockets / Socket.io, databases / ORM, authentication / JWT / sessions,
  new state-management or routing libraries, CSS-in-JS solutions.

## Spec Kit Workflow

All feature work MUST follow this lifecycle:

1. **Discovery** — Read existing code, document gaps and assumptions in discoverNotes.md.
2. **Specify** — Write acceptance criteria in a spec artifact under `.specify/`.
3. **Clarify** — Resolve ambiguity with stakeholders before planning.
4. **Plan** — Document state model changes, file-level changes, and data flow.
5. **Tasks** — Decompose the plan into ordered, independently testable tasks.
6. **Implement** — Complete one meaningful slice at a time and commit.
7. **Validate** — Verify acceptance criteria with real browser testing (two tabs).

Commit after each step. Keep commits granular and explainable.

## Governance

This constitution supersedes all other practices. Amendments MUST be documented with version
rationale. Version numbering follows semantic versioning:

- **MAJOR**: Backward-incompatible principle changes, removals, or redefinitions.
- **MINOR**: New principle or section added, materially expanded guidance.
- **PATCH**: Clarifications, wording fixes, non-semantic refinements.

All PRs MUST verify compliance with the principles defined here. Use `AGENTS.md` for
runtime development guidance (commands, patterns, forbidden technologies).

**Version**: 1.0.0 | **Ratified**: 2026-06-01 | **Last Amended**: 2026-06-01
