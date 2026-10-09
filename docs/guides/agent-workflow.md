# Agent workflow rules

> Repo-wide agent rules: read AGENTS.md, the standards and dependency docs, sibling worktrees, temp files and skills.
>
> Status: accepted · Version 4

## Read first

- Read the repo's `AGENTS.md` before changing anything — not `CLAUDE.md`. If it is missing, ask the user to create one.
- Read this repo's [standards](../standards/index.md) and [patterns](../patterns/index.md) before writing code. Every repo's `AGENTS.md` links there, not to files in the `agents` repo root. Read only the docs your task touches.
- Then read the docs of the repos your repo depends on — see [reading dependent repos' docs](dependent-repos.md).
- Where a rule describes one repo, one library or one local tool, it belongs in the repo that owns that thing, not here.

## Temp files

Write scratch files under the Windows temp directory (`%TEMP%`) in a per-task subfolder — never into a repo, and never into a `tmp/` folder inside one.

## Personal stack

Folder layout, sibling worktrees and sibling-source resolution apply to this personal stack only, never to every repo: see [personal-stack layout](personal-stack-layout.md).

## Logging

Logging rules live with the logger: see the logging guide in the `common` repo. The log aggregation service and its MCP tooling belong to the application that runs them, and Vision documents its own.

## Skills

Check the [skills catalog](skills-catalog.md) before invoking a skill: run `test-design` before writing tests or code, `debugger` on any bug, and `documentation-writer` for any code change.
