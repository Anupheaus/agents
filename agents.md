# Global Agent Instructions

This file is the single source of truth for AI agents working across all personal repos. Read it in full before doing anything else.

---

## Repos

All personal repos live at `c:/code/personal/`. The active repos are: `common`, `react-ui`, `mxdb`, `nexus`, and `vision`. Only touch files in these repos; do not modify any other repos under that path.

For a detailed overview of each repo and how they relate to each other, see `[local-repos.md](./local-repos.md)`.

---

## Repo Context File

All repos should contain an `AGENTS.md` file in the root. **Read `AGENTS.md` instead of `CLAUDE.md`** to learn about the repo before making changes. If `AGENTS.md` is not present, ask the user to create one.

---

## Temporary Files

Always write temporary/scratch files (throwaway scripts, intermediate output, debug dumps, test fixtures not meant to be checked in, etc.) under `//c/Users/email/AppData/Local/Temp/` — this is the user's Windows per-user temp directory (`%TEMP%`).

**Why:** Keeps the project working tree clean, avoids accidental commits of scratch files, and keeps temp artefacts in a location the OS and user already manage.

**How to apply:**

- Never drop scratch files into the repo root or `tmp/` subdirectories of project repos.
- Prefer a descriptive subfolder per task, e.g. `//c/Users/email/AppData/Local/Temp/claude-<short-task-name>/`, so parallel sessions don't collide.
- When passing a path to a tool that needs forward slashes (bash, most CLIs), use the `//c/Users/email/AppData/Local/Temp/...` form. When a tool needs native Windows paths, use `C:\Users\email\AppData\Local\Temp\...`.
- Files under this directory do not need to be cleaned up at end-of-task — the OS manages retention.

---

## Git Worktrees

**Always create worktrees in the repo's parent folder, as a sibling of the repo — not nested inside it.** For a repo at `c:/code/personal/<repo>`, place the worktree at `c:/code/personal/<repo>-<feature>` (e.g. `c:/code/personal/vision-public-quote-payment`).

**Why:** These repos resolve `@anupheaus/*` imports to sibling source via tsconfig paths / vitest aliases (`../<repo>/src`). A worktree nested inside the repo (e.g. under `.claude/worktrees/`) breaks that `../<repo>` resolution, so `tsc`, tests, and lint can't see `common`, `react-ui`, `mxdb`, or `nexus`. A sibling worktree keeps `../common`, `../react-ui`, etc. resolving exactly as in the primary checkout.

**How to apply:**
- Do NOT use a native worktree tool that forces placement under `.claude/worktrees/`; use the git fallback with an explicit sibling path: `git worktree add c:/code/personal/<repo>-<feature> -b feature/<feature>`.
- Follow the existing sibling naming convention (`vision-purchase-ordering`, `vision-subscription-window`, …).

---

## Superpowers: Plan Execution

After writing an implementation plan, always proceed directly with **Subagent-Driven execution** (option 1). Do not ask the user to choose — invoke `superpowers:subagent-driven-development` immediately.

---

## Coding Standards

You MUST read BOTH of the following files using the Read tool BEFORE writing or modifying any code. This is non-negotiable and cannot be skipped under any circumstances — even for small changes, single-line edits, or "obvious" fixes. Do not write a single line of code until you have read both files in the current conversation.

1. `C:\code\personal\agents\coding-standards.md`
2. `C:\code\personal\agents\patterns.md`



Key points (these do not replace reading the full docs):

- Clarity over cleverness; small, single-purpose functions and files.
- Strong TypeScript typing; no `any`; validate at boundaries.
- **Check `@anupheaus/react-ui` before creating any React component, hook, or provider.**
- One component per file; no inline `.map()` in JSX; no inline `style={{}}` props.
- Prefer `@anupheaus/common` helpers over re-implementing utilities.

---

## Logging

**Applies to repos that use `Logger` from `@anupheaus/common`** (personal stack: `common`, `react-ui`, `mxdb`, `nexus`, `vision`).

| User says | Do this |
|-----------|---------|
| **"Look through the logs"** / **"read the logs"** | Query the project's log aggregation service via its MCP server — not terminal, browser console, or local log files |
| **"Add more logging"** | Add permanent **`Logger`** calls (`info`, `debug`, `silly`, `warn`, …) with useful `meta` — not temporary `console.log`. More logging = easier debugging |

---

## Forge's database (where its projects, epics and tickets live)

The MongoDB MCP server is connected to a *local* MongoDB (`vision`, `vision-2`, … are the Vision app's own data). **Forge's data is not there.** It is in MongoDB Atlas, reached by the Forge service Worker (`forge/worker`, `POST /v1/db`).

- **Connection:** `MONGODB_URI` in `c:/code/personal/forge/worker/.dev.vars` (Atlas `Cluster0`). It holds a password: read it from the file inside a script, never print it or paste it into chat or a doc.
- **Database:** one per customer, named `customer_<id>` (currently `customer_ec245615835a42f7`; the name is the `db_name` column of the Worker's `customers` table). List the databases to find it.
- **Collections:** `projects` (`vision` = Vision, key `VIS`; `ledger` = Ledger, key `LED`), then per project `p.<project>.<name>`: `tickets`, `epics`, `meta` (`nextTicket` is the next ticket number), `docs`, `docVersions`, `messages`, `statuses`, `pullRequests`, `ciRuns`, `memories`. Shapes are in `forge/shared/domain.ts` (`Ticket`, `Epic`); `forge/server/src/store.ts` is the only code that reads and writes them.
- **How to reach it:** a small Node script in the temp folder, using `createRequire('C:/code/personal/forge/worker/package.json')` to load `mongodb`, with the URI read from `.dev.vars`. Look (read-only) before writing, and keep tickets consistent with `store.createTicket` (claim a number in `meta.nextTicket`, `_id` equal to `id`, e.g. `VIS-1`).
- Forge normally creates tickets itself (the Product Owner agent via `edit_board`); writing to the database directly is for seeding or testing, and only when the user asks.

---

## Shortcut (Vision's tickets)

Vision's tickets, epics and their states live in **Shortcut**, not in Forge's database and not in the local MongoDB. Workspace `lintex-vision` (`https://app.shortcut.com/lintex-vision`). The story and epic bodies, comments and acceptance criteria there are the source of truth to compare a Forge ticket against.

- **Best path: the Shortcut MCP.** It is already configured for Vision: `vision/.mcp.json` runs `npx -y @shortcut/mcp@latest` with `SHORTCUT_API_TOKEN`, and `~/.claude.json` also registers it as an HTTP MCP at `https://mcp.shortcut.com/mcp`. Use its tools when the host exposes them.
- **No Shortcut MCP tools (e.g. in Kilo): call the HTTP MCP directly.** Auth is OAuth, *not* a static API token, so do not hunt for a `SHORTCUT_API_TOKEN` in the shell.
  1. Tokens are in `C:\Users\email\.claude\.credentials.json` under the `mcpOAuth` key whose name starts `shortcut|` (`accessToken`, `refreshToken`, `expiresAt`). The access token lasts **30 minutes**.
  2. If it is expired (`WWW-Authenticate: … invalid_token … The access token expired`), refresh it: `POST https://api.app.shortcut.com/oauth-authorization-code-flow/token`, form-encoded, with `grant_type=refresh_token`, `refresh_token=<refreshToken>`, `client_id=https://claude.ai/oauth/claude-code-client-metadata`. **The refresh token rotates**, so write the new `accessToken` and `refreshToken` (and `expiresAt`) back to `.credentials.json` or the user's Claude session breaks.
  3. Call the MCP: `POST https://mcp.shortcut.com/mcp` with `Authorization: Bearer <accessToken>`, `Accept: application/json, text/event-stream`, `Content-Type: application/json`. Send `initialize` first, keep the `mcp-session-id` response header, POST `notifications/initialized`, then `tools/call`. Responses are SSE: read the `data: {…}` line. `curl -s -D -` is enough; only `initialize` needs to be a real session, and every call in the session carries the `mcp-session-id` header.
- **Tools and arguments that matter:** `stories-search` (`query`), `stories-get-by-id` (`storyPublicId`, a number), `epics-get-by-id`; a story id is the number in `…/story/<id>`. List stories first, then fetch the one you want in full.
- **Vision's own agents** (`vision/.claude/skills/vision-orchestrator/`) read Shortcut states through `SHORTCUT_API_TOKEN` in the environment; that token is for those scripts, not for the MCP.
- Never print tokens, paste them into chat, or commit them.

---

## Personal Skills

Before invoking any skill, check `[skills-catalog.md](./skills-catalog.md)` for the full list of available personal skills, their trigger conditions, and what each one does. Skill files live in `C:\code\personal\agents\skills\`.

Key defaults:

- **Writing code, implementing a feature, fixing a bug, or working with tests** → invoke `test-design` first
- **Auditing tests or finding gaps in test coverage** → invoke `test-design` first
- **Encountering a bug or unexpected behaviour** → invoke `debugger` first
- **Adding, changing, or deleting code** → invoke `documentation-writer` as part of the work

All personal skill files should be written to `C:\code\personal\agents\skills\` and copied to `C:\Users\email\.claude\skills\`. A skill that only applies to one project lives in that repo's `.claude/skills/` instead (Vision's Shortcut skills are in `vision/.claude/skills/`) — see the catalog's "Project skills" section.