# Agent workflow rules

> Repo-wide agent rules: read AGENTS.md and the standards, sibling worktrees, temp files, logging and which skills to run.
>
> Status: accepted · Version 1

## Read first

- Read the repo's `AGENTS.md` before changing anything — not `CLAUDE.md`. If it is missing, ask the user to create one.
- Read the coding standards and patterns before writing code: `coding-standards.md` and `patterns.md` in this repo, mirrored under `docs/standards/` and `docs/patterns/`.

## Repos

Personal repos live at `c:/code/personal/`: `common`, `react-ui`, `mxdb`, `nexus`, `vision`. Touch nothing else there. See [repos and relationships](repos-and-relationships.md).

## Worktrees

Create worktrees as a sibling of the repo, never nested inside it: `c:/code/personal/<repo>-<feature>`. These repos resolve `@anupheaus/*` to sibling source via tsconfig paths, so a nested worktree breaks `tsc`, lint and tests.

## Temp files

Write scratch files under the Windows temp directory (`%TEMP%`) in a per-task subfolder — never into a repo, and never into a `tmp/` folder inside one.

## Logging

"Look through the logs" means query the project's log aggregation MCP server, not the terminal or local files. "Add more logging" means permanent `Logger` calls from `@anupheaus/common` with useful `meta`, not temporary `console.log`.

## Skills

Check the [skills catalog](skills-catalog.md) before invoking a skill: run `test-design` before writing tests or code, `debugger` on any bug, and `documentation-writer` for any code change.
