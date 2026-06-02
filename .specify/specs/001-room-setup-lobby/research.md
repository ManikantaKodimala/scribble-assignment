# Research: Room Setup & Lobby

No unresolved unknowns. All technology choices are established by the project starter and
constitution:

- **Backend language**: TypeScript 5.6 (already in use)
- **Frontend framework**: React 18 + Vite 5 (already in use)
- **Validation**: Zod 3 (already in use)
- **Testing**: Vitest 3 (already in use)
- **Sync mechanism**: HTTP polling (constitution mandate, no WebSockets)
- **Storage**: In-memory (constitution mandate, no database)

The polling approach is well-understood: the frontend calls `GET /rooms/:code` on a ~2s
interval. The response includes participant list and room status. On status change to
`"playing"`, the frontend auto-navigates to `/game`.

No research was required beyond reading the existing codebase and spec.
