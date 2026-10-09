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

Recurring implementation patterns shared across the personal repos — read the relevant ones before writing code.

- [Card, Dialog and Window responsibilities](patterns/card-dialog-window.md): Cards present, Dialogs own ephemeral record state, Windows take an id and fetch, persisting across reloads.
- [Client / common / server boundaries](patterns/client-common-server-boundaries.md): Where code belongs across client, common and server folders, and why common must depend on neither.
- [Expose domain logic through useXxx hooks](patterns/domain-hooks.md): Each domain owns a hook in its own folder that returns named operations; consumers hold no domain logic.
- [Organise code by domain, in focused files](patterns/domain-organisation.md): Extract standalone logic into small single-purpose files and group files by domain, not by technical type.
- [Types live in *-models.ts files](patterns/models-files.md): Where domain and shared types are defined, plus With* shape constraints and the interface + namespace record pattern.
- [Abstract third-party providers behind one domain API](patterns/provider-abstraction.md): One provider-agnostic domain function routes to per-vendor adapter files, so adding a provider changes no call-sites.
- [Lift JSX-returning helpers into components](patterns/render-helpers.md): A function that returns JSX is a component: define it at module level or in a sibling file, never inside another component.
- [Selector components own their collection](patterns/selector-components.md): A selector takes value and onChange, fetches its own options, and builds list items with useMemo and toListItems.
- [Throw typed errors from @anupheaus/common](patterns/typed-errors.md): Use the most semantically accurate typed error class instead of Error, so catch boundaries can guard precisely.
- [Use useFields for record editing](patterns/use-fields.md): Wire record fields declaratively with useFields and its Field component instead of one useBound callback per field.
- [Keep local state in sync with useUpdatableState](patterns/use-updatable-state.md): useUpdatableState resolves provided, previous then default state and reacts to a prop changing while mounted.
- [Validation and loading states](patterns/validation-and-loading.md): Use useValidation with ValidateSection for input errors, and UIState with isLoading before rendering data-dependent children.
- [Window parameters must be primitives](patterns/window-parameters.md): Window parameters are persisted and deserialised, so pass only primitives and fetch the record by id inside the window.

## [Guides](guides/index.md)

How working in these repos works: agent rules, personal skills, shared CI templates and the repo map.

- [Agent workflow rules](guides/agent-workflow.md): Repo-wide agent rules: read AGENTS.md and the standards, sibling worktrees, temp files, logging and which skills to run.
- [Shared CI templates](guides/ci-templates.md): The shared pnpm-setup composite action and publish workflow template in ci-templates, and how repos pin to them.
- [Repos and how they relate](guides/repos-and-relationships.md): The personal-stack repos, what each one is, and the dependency direction from common up to vision.
- [Personal skills catalog](guides/skills-catalog.md): The personal skills in this repo, when to invoke each, where the skill files live and how to add one.
