## Local repositories in `c:/code/personal`

This is a living overview of key local repositories and what they are for. Repositories are listed alphabetically. Where available, each repo links to an `agent.md`/`AGENTS.md` file for deeper details.

- **`anux-filr`**: Private React/TypeScript document and file utility app (PDF viewing/manipulation and Google Drive integration). See [`anux-filr/agent.md`](../anux-filr/agent.md).
- **`api-server`**: Koa-based API and real-time server that wires controllers, views, static files, and subscriber endpoints together, using `@anupheaus/ssl-server` for HTTPS. See [`api-server/agent.md`](../api-server/agent.md).
- **`mxdb`**: Real-time MongoDB ↔ client sync library with React hooks and a comprehensive integrity test suite. See [`mxdb/agent.md`](../mxdb/agent.md).
- **`common`**: Core shared TypeScript utilities (`@anupheaus/common`) providing extensions, models, logging, auditing, collections, and more for other repos. See [`common/agent.md`](../common/agent.md).
- **`react-ui`**: Shared React component library (`@anupheaus/react-ui`) with Storybook, testing, and agent docs. See [`react-ui/agent.md`](../react-ui/agent.md).
- **`nexus`**: Real-time typed API library built on Socket.IO (`@anupheaus/nexus`) providing actions, events, and subscriptions with React hooks. See [`nexus/agent.md`](../nexus/agent.md).
- **`vision`**: Multi-target (web/tablet/controller/server) application that uses MXDB Sync, Socket API, React UI, and SSL Server to deliver a production app (likely scheduling/field tooling) with offline-capable sync. See [`vision/agent.md`](../vision/agent.md).

### High-level architecture / relationships

- **Core libraries**
  - **`common`**: Lowest-level utilities, models, logging, and helpers. Used by almost everything.
  - **`react-ui`**: Shared React UI layer built on top of `common`.
  - **`nexus`**: Real-time actions/events/subscriptions, built on Socket.IO and reusing `common`/`react-ui`.
  - **`mxdb`**: Sync engine (server + client + common) for MongoDB ↔ client data with offline support.

- **Backend host**
  - **`api-server`**: Uses `ssl-server` for HTTPS, `nexus` for real-time subscribers, and `common` for core utilities. Intended as the main HTTP + WebSocket API host for frontends.

- **Applications**
  - **`vision`**: Main product app that depends on `common`, `react-ui`, `nexus`, and `mxdb` to provide a multi-target (web/tablet/controller/server) experience with offline-capable sync.
  - **`anux-filr`**: Standalone document/file utility app, built on React and `anux-*` libraries; more loosely coupled to the `@anupheaus/*` stack.


Other entries in `c:/code/personal` such as archives (`*.zip`) and `archived projects/`, `certs/`, `images/` are not considered active code repositories.

You can extend or refine these descriptions as projects evolve.
