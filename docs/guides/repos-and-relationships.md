# Repos and how they relate

> The personal-stack repos, what each one is, and the dependency direction from common up to vision.
>
> Status: accepted · Version 1

Repos live at `c:/code/personal/`. This is the shape of them and the dependency direction between them.

| Repo | What it is |
|---|---|
| `common` | Lowest-level shared TypeScript utilities (`@anupheaus/common`): extensions, models, logging, auditing, collections. Used by almost everything. |
| `react-ui` | Shared React component library (`@anupheaus/react-ui`) built on `common`, with Storybook and agent docs. |
| `nexus` | Real-time typed API library (`@anupheaus/nexus`) on Socket.IO: actions, events, subscriptions, React hooks. |
| `mxdb` | Sync engine (`@anupheaus/mxdb`) for MongoDB ↔ client data with offline support, plus React hooks. |
| `vision` | The product app: multi-target web / tablet / controller / server, using `mxdb`, `nexus`, `react-ui` and `common`. |

## Backend host

`api-server` (Koa + `@anupheaus/ssl-server`) wires controllers, views, static files and Nexus subscribers. It is intended as the main HTTP and WebSocket host for frontends; it is not part of the Vision board.

## Direction of dependency

`common` → `react-ui` → `nexus`/`mxdb` → `vision`. Nothing in the lower layers imports upward, and `mxdb`, `nexus` and `vision` all resolve `@anupheaus/*` to sibling source, which is why worktrees must be siblings of the repo (see [agent workflow rules](agent-workflow.md)).

Other folders under `c:/code/personal` — archives, `certs/`, `images/`, `archived projects/` — are not active repos.
