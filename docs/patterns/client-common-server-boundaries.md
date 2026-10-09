# Client / common / server boundaries

> Where code belongs across client, common and server folders, and why common must depend on neither.
>
> Status: accepted · Version 1

## When to use

Any repo with `src/client/`, `src/common/` and `src/server/` folders.

## How to apply

- Client-only code → `client/`; server-only → `server/`; anything usable by both → `common/` (models, shared types, validation schemas, pure utilities, constants).
- `common/` must **never** import from `client/` or `server/` — no cross-boundary dependencies.
- When placing a new file, ask: "could this ever be needed on the other target?" Yes → `common/`. Runtime-specific → the matching target folder.

## Avoid

- Importing server modules from client, or the reverse, by passing through `common/`.
- Putting a shared type inside a client or server file just because that is where it was first needed.
