# Skills Catalog

Personal skills live in `C:\code\personal\agents\skills\` (source of truth) and are symlinked/copied to `C:\Users\email\.claude\skills\` for use by Claude Code.

Each skill has a `SKILL.md` (or `skill.md`) file that contains the full instructions. This catalog lists when and why to invoke each one.

---

## test-design

**File:** [`skills/test-design/skill.md`](./skills/test-design/skill.md)

**Invoke when:**
- Writing, adding, or fixing tests for any code or functionality
- Implementing a feature or bug fix (invoke before writing tests)
- Asked to audit tests or find gaps in test coverage
- Reviewing the quality of an existing test suite

**What it does:** Two-mode skill. In *writing mode* it guides how to think about, structure, and write tests (test intent not implementation, exhaustive input partitioning, refactor-safe tests). In *audit mode* it scans an existing test suite, identifies gaps, and produces a prioritised report.

---

## debugger

**File:** [`skills/debugger/SKILL.md`](./skills/debugger/SKILL.md)

**Invoke when:**
- Encountering any bug or unexpected behaviour
- Asked to investigate, look at, or examine an issue
- Before reasoning about possible causes of a problem

**What it does:** Instrument-first debugging. Rather than reasoning about causes up front, it adds diagnostics and runs — repeating until the cause is obvious — then fixes with a failing test first.

---

## documentation-writer

**File:** [`skills/documentation-writer/SKILL.md`](./skills/documentation-writer/SKILL.md)

**Invoke when:**
- Code is being added, changed, or deleted (even without an explicit request to document)
- Writing docs for specific functions, modules, or files
- Asked to audit documentation for a whole repo or broad area
- Any time documentation is mentioned in any form

**What it does:** Two-mode skill. In *writing guide mode* it applies documentation standards to produce high-quality inline comments, `AGENTS.md` files, and `README.md` files. In *audit mode* it scans a repo, identifies documentation gaps, generates a prioritised report, gets user sign-off, then implements what they ask for.

---

## ci-pipeline-writer (pipeline-auditor)

**File:** [`skills/ci-pipeline-writer/SKILL.md`](./skills/ci-pipeline-writer/SKILL.md)

**Invoke when:**
- CI, pipelines, workflows, automated testing, or automated deployment are mentioned
- Asked to set up, fix, improve, or review a pipeline — even casually ("can you add CI?", "my pipeline is slow")
- Opening or modifying `.github/workflows/`, `.gitlab-ci.yml`, `azure-pipelines.yml`, `.circleci/config.yml`, `bitbucket-pipelines.yml`
- Asked to audit a repo, its configuration, build tooling, or build setup
- Mentions of `webpack.config.js`, `tsconfig.json`, `.eslintrc.js`, or `eslint.config.js`

**What it does:** Audits the repo's CI pipeline and build tooling against a master checklist, presents findings, implements the chosen fixes, then commits. Supports GitHub Actions, GitLab CI, Azure Pipelines, CircleCI, and Bitbucket Pipelines.

---

## Project skills (kept in their own repo)

Skills that only apply to one project live in that repo's `.claude/skills/`, so every session in the repo gets them and there is one copy to maintain. They are not copied here or into `~/.claude/skills`.

**Vision** — [`vision/.claude/skills/`](../vision/.claude/skills/), for work in the `lintex-vision` Shortcut workspace (Shortcut is the spec):

| Skill | Invoke when |
|---|---|
| `implementing-a-vision-epic` | Taking a whole Vision epic from nothing to a ready-to-merge pull request: one epic → one sibling worktree → one branch → one PR, story by story, ending in the hand-back report. |
| `implementing-a-vision-ticket` | Implementing one Shortcut story (or working an epic's stories one at a time): failing test first, the project's non-negotiables, UI and error standards, the UX persona review, and the per-ticket done checklist. |
| `refining-vision-work` | Refining, grooming, splitting or tidying a Vision epic or story, or when a ticket looks stale, vague, oversized or already done — always verified against the code on the branch that ships. |

---

## Adding New Skills

1. Create a new folder under `C:\code\personal\agents\skills\<skill-name>\`
2. Add a `SKILL.md` with the frontmatter (`name`, `description`) and full instructions
3. Add an entry to this catalog
4. Update the reference in `agents.md` if needed
5. Copy/symlink to `C:\Users\email\.claude\skills\` so Claude Code can find it
