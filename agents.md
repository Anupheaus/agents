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

## Logging and New Relic

**Applies to repos that use `Logger` from `@anupheaus/common`** (personal stack: `common`, `react-ui`, `mxdb`, `nexus`, `vision`).

| User says | Do this |
|-----------|---------|
| **"Look through the logs"** / **"read the logs"** | Query **New Relic** via MCP (`nrql`, `getLogs`) — not terminal, browser console, or local log files |
| **"Add more logging"** | Add permanent **`Logger`** calls (`info`, `debug`, `silly`, `warn`, …) with useful `meta` — not temporary `console.log`. More logging = easier debugging |

New Relic MCP credentials: `C:\Users\email\.cursor\local-secrets\newrelic.json` (see also global Cursor rule `logging-and-new-relic`).

---

## Personal Skills

Before invoking any skill, check `[skills-catalog.md](./skills-catalog.md)` for the full list of available personal skills, their trigger conditions, and what each one does. Skill files live in `C:\code\personal\agents\skills\`.

Key defaults:

- **Writing code, implementing a feature, fixing a bug, or working with tests** → invoke `test-design` first
- **Auditing tests or finding gaps in test coverage** → invoke `test-design` first
- **Encountering a bug or unexpected behaviour** → invoke `debugger` first
- **Adding, changing, or deleting code** → invoke `documentation-writer` as part of the work

All personal skill files should be written to `C:\code\personal\agents\skills\` and copied to `C:\Users\email\.claude\skills\`.