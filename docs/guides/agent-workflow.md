# Agent workflow rules

> Repo-wide agent rules: read AGENTS.md and the standards, sibling worktrees, temp files, logging and which skills to run.
>
> Status: accepted · Version 2

## Read first

- Read the repo's `AGENTS.md` before changing anything — not `CLAUDE.md`. If it is missing, ask the user to create one.
- Read the cross-repo coding standards and patterns before writing code. Their canonical home is this repo's [standards](../standards/index.md) and [patterns](../patterns/index.md) folders; every repo's `AGENTS.md` should link there, not to files in the `agents` repo root. Read only the docs your task touches.

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
