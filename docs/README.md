# Vision docs

Architecture decisions, patterns and coding standards. Each doc is short and covers one topic: scan this index, then open only the docs your task touches. Every folder also has an `index.md` describing what's in it.

These files are maintained by the Architect agent in Forge and synced from there, so edits made here by hand will be overwritten. To change or record a decision, tell any Forge agent; it goes to the Architect.

## [Standards](standards/index.md)

Cross-repo standards: code style, type safety, structure and architecture, git and project hygiene.

- [Code style and formatting](standards/code-style.md): Personal style rules for all repos: functional/hook-driven code, formatting, naming and readability.
- [Git and project hygiene](standards/git-and-project-hygiene.md): Commit and repo hygiene: small focused commits that explain why, no dead code, tidy config.
- [Structure and architecture](standards/structure-and-architecture.md): Single responsibility, barrel-only index.ts, import and export rules, shared libraries, testability.
- [Type safety](standards/type-safety.md): TypeScript rules: no any, named shapes only, import type, explicit returns, nullish idioms.

## [Patterns](patterns/index.md)

Patterns every repo follows: client/common/server boundaries, domain organisation and hooks, models files, providers, typed errors.

- [Client / common / server boundaries](patterns/client-common-server-boundaries.md): Where code belongs across client, common and server folders, and why common must depend on neither.
- [Expose domain logic through useXxx hooks](patterns/domain-hooks.md): Each domain owns a hook in its own folder that returns named operations; consumers hold no domain logic.
- [Organise code by domain, in focused files](patterns/domain-organisation.md): Extract standalone logic into small single-purpose files and group files by domain, not by technical type.
- [Types live in *-models.ts files](patterns/models-files.md): Where domain and shared types are defined, plus With* shape constraints and the interface + namespace record pattern.
- [Abstract third-party providers behind one domain API](patterns/provider-abstraction.md): One provider-agnostic domain function routes to per-vendor adapter files, so adding a provider changes no call-sites.

## [Guides](guides/index.md)

Cross-repo agent guides: workflow rules, skills, CI templates, dependency docs, personal-stack layout.

- [Agent workflow rules](guides/agent-workflow.md): Repo-wide agent rules: read AGENTS.md, the standards and dependency docs, sibling worktrees, temp files and skills.
- [Shared CI templates](guides/ci-templates.md): The shared pnpm-setup composite action and publish workflow template in ci-templates, and how repos pin to them.
- [Reading dependent repos' docs](guides/dependent-repos.md): The rule that a task reads the docs of every repo it depends on, and where that dependency list lives.
- [Personal-stack layout](guides/personal-stack-layout.md): Personal-stack only: repos live under c:/code/personal, worktrees are siblings, @anupheaus/* resolves to sibling source.
- [Personal skills catalog](guides/skills-catalog.md): The personal skills in this repo, when to invoke each, where the skill files live and how to add one.
