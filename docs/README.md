# Vision docs

Architecture decisions, patterns and coding standards. Each doc is short and covers one topic: scan this index, then open only the docs your task touches. Every folder also has an `index.md` describing what's in it.

These files are maintained by the Architect agent in Forge and synced from there, so edits made here by hand will be overwritten. To change or record a decision, tell any Forge agent; it goes to the Architect.

## [Standards](standards/index.md)

Coding standards every agent must follow before writing or modifying code in any personal repo.

- [Code style and formatting](standards/code-style.md): Personal style rules for all repos: functional/hook-driven code, formatting, naming and readability.
- [Git and project hygiene](standards/git-and-project-hygiene.md): Commit and repo hygiene: small focused commits that explain why, no dead code, tidy config.
- [React standards](standards/react-standards.md): React rules: one component per file, no inline JSX callbacks, styles, maps or object props.
- [Structure and architecture](standards/structure-and-architecture.md): Single responsibility, barrel-only index.ts, import and export rules, shared libraries, testability.
- [Type safety](standards/type-safety.md): TypeScript rules: no any, named shapes only, import type, explicit returns, nullish idioms.

## [Patterns](patterns/index.md)

Recurring implementation patterns shared across the personal repos — read before writing code.

- [Client / common / server boundaries](patterns/client-common-server-boundaries.md): Where code belongs across client, common and server folders, and why common must depend on neither.
