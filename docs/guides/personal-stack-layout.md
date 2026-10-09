# Personal-stack layout

> Personal-stack only: repos live under c:/code/personal, worktrees are siblings, @anupheaus/* resolves to sibling source.
>
> Status: accepted · Version 1

> **Personal-stack only.** This describes one developer's local checkout. It is not a rule every repo must follow; another workspace lays its repos out however it likes.

## Where the repos live

Personal repos live at `c:/code/personal/`: `common`, `react-ui`, `mxdb`, `nexus`, `vision`. Touch nothing else there.

Other folders under `c:/code/personal` — `archives/`, `certs/`, `images/`, `archived projects/` — are not active repos.

## Worktrees

Create worktrees as a sibling of the repo, never nested inside it: `c:/code/personal/<repo>-<feature>`. These repos resolve `@anupheaus/*` to sibling source through tsconfig paths, so a nested worktree breaks `tsc`, lint and tests.

## The backend host

`api-server` (Koa + `@anupheaus/ssl-server`) wires controllers, views, static files and Nexus subscribers, and is intended as the main HTTP and WebSocket host for frontends. It is not part of the Vision board.
