---
name: documentation-writer
description: >
  Two-mode documentation skill. AUDIT MODE: triggered when the user asks about documentation
  for a whole repo or broad area — "what docs are missing from X", "audit the docs", "document
  this whole repo", "how is the documentation in Y". Scan the repo, identify gaps, generate a
  prioritised report, get user sign-off, then implement what they ask for. WRITING GUIDE MODE:
  triggered whenever code is being added, changed, or deleted (even without an explicit request),
  or when writing docs for specific functions, modules, or files. Apply the documentation
  standards below to produce high-quality inline comments, AGENTS.md files, and README.md files.
  Always invoke this skill when touching code or when documentation is mentioned in any form.
---

# Documentation Writer

This skill has two modes. Read the trigger conditions and use the right one.

---

## Core principle: one place, one truth

Documentation should never repeat itself. Every piece of information belongs in exactly one place — the most specific place where it is true. If something is documented in a child AGENTS.md, the parent does not repeat it; it links to it. If something is in an inline doc comment, AGENTS.md does not copy it; it references the function by name. If something is in AGENTS.md, the README does not restate it; it summarises it in one sentence and points the reader to the AGENTS.md for detail.

The only deliberate exception is the root README. It may contain brief summaries of things documented elsewhere, but always with a pointer — "see `src/hooks/AGENTS.md` for full details". The README's job is orientation, not exhaustive reference.

When writing or auditing, ask: is this already documented somewhere more specific? If yes, link rather than repeat.

---

## Which mode to use

**Audit mode** — the user is asking about documentation at a whole-repo or broad-area level.
Signals: "what docs are missing", "audit the docs", "document this whole repo", "how is the
documentation in X", "do a docs pass on the whole thing". The key marker is *breadth* — they're
not asking you to write a specific doc, they're asking you to assess and report.

**Writing guide mode** — you are writing or updating documentation for specific code, or code
is changing and docs need to follow. This is the default whenever code is touched.

---

## Mode 1: Audit

The goal is to give the user a clear, actionable picture of what's missing before doing any work.
Don't write docs during the audit — report first, implement after.

### Step 1: Scan the repo

Start by walking the full directory tree — list every directory, note how many files it contains and whether it has subdirectories with code. This walk is the foundation of the audit. Do it before reading any code.

Then check for the following gaps:

**AGENTS.md gaps — this is the primary audit concern:**

AGENTS.md files form a hierarchical finding tree. An agent should be able to drop into the root AGENTS.md and navigate to any part of the codebase by following links, without needing to know the directory layout. Think of it as the `index.ts` for finding — not for importing.

For each directory identified in the tree walk, decide:
- Does it warrant its own AGENTS.md? The primary question is not file count — it's whether the directory's purpose or contents would benefit from explanation. Read the files themselves if needed. A directory with 2–3 complex or non-obvious files absolutely warrants one. A directory with many files almost certainly does. A directory with a handful of trivially self-explanatory files probably doesn't — mention it inline in the parent instead.
- If it warrants one, does it exist?
- If it exists, does it link to children that warrant their own file?
- If it exists, is it grouped by functional category or just alphabetical?
- If it exists, does it include decision rationale and gotchas, or just a list of exports?

Flag every directory that warrants an AGENTS.md but lacks one as a **critical gap**. Missing AGENTS.md files are the most impactful finding — they block an agent from navigating the codebase at all.

Also check:
- `AGENTS.md` files that exist but are out of date (reference deleted exports, wrong structure)
- `AGENTS.md` files missing key sections (architecture, decision rationale, gotchas)
- Missing lateral cross-links between modules that interact with each other

**README.md gaps:**
- No root `README.md`, or one that is significantly incomplete
- Missing sections: problem statement, env vars, known limitations, errors, tech stack, usage
- Stale content (describes APIs or behaviour that no longer exists)

**Inline documentation gaps:**
- Exported functions, classes, interfaces, types, and enums with no doc comment
- Non-obvious logic with no explanation
- Props or parameters with constraints that aren't documented
- Anything ambiguous that could be misread

**Stale documentation:**
- Docs that reference deleted or renamed code
- Cross-links that point to non-existent files or sections

### Step 2: Generate the gap report

Present findings as a table, one row per finding. Be specific — "No AGENTS.md in `src/utils/`" is useful; "documentation could be better" is not.

```
## Documentation Audit: [Repo Name]

| Finding | Severity | Recommendation |
|---------|----------|----------------|
| No AGENTS.md in `src/hooks/` — 33 hooks with no navigation entry point | 🔴 High | Create AGENTS.md grouping hooks by category |
| `README.md` missing env vars section | 🟡 Medium | Add environment variables table |
| `src/utils/debounce.ts` has no TSDoc on exported function | 🟢 Low | Add inline doc comment |
| ... | | |

**X issues found (Y 🔴 high, Z 🟡 medium, W 🟢 low)**

### Already well-documented
- [areas that are in good shape — important so the user knows what to trust]
```

Severity key:
- 🔴 **High** — missing entirely or actively misleading; blocks an agent or developer from understanding the code
- 🟡 **Medium** — present but incomplete; a consumer would hit gaps
- 🟢 **Low** — hygiene / would improve clarity but not urgent

### Step 3: Present the report and wait

Show the user the table and ask what they'd like to tackle. Do not start writing docs yet.
Suggested framing: "Here's what I found. Want me to tackle all of it, just the high-severity items, or specific areas?"

### Step 4: Implement what the user approves

Once the user says what to do, switch to Writing Guide mode (below) and execute.

---

## Mode 2: Writing Guide

Apply these standards whenever writing or updating documentation. The primary agent-facing
audience for `AGENTS.md` files and inline comments is an AI agent (future Claude instance)
that needs to understand intent and constraints without running the code. The primary audience
for `README.md` is a human developer evaluating or getting started with the repo.

### The three document types

**1. Inline doc comments** — in source files, immediately above functions, classes, types,
interfaces, enums, and non-obvious variables. Use the language's idiomatic format (TSDoc/JSDoc
for TS/JS, docstrings for Python, `///` for Rust, etc.).

**2. `AGENTS.md` files** — one per directory with meaningful code. Agent-readable orientation
documents. Explain the module's purpose, structure, decision rationale, ambiguities, and cross-links.

**3. Root `README.md`** — one per repo. Human-readable. Covers what it is, the problem it
solves, tech stack, how to use it, env vars, limitations, errors, and gotchas.

---

### Inline doc comments: how to write them

**Document:**
- Exported/public functions, classes, interfaces, types, enums
- Non-obvious private logic
- Parameters with constraints, expected formats, or gotchas
- Return values with meaning beyond their type
- Side effects, async behaviour, error conditions
- Anything with **behavioural ambiguity** — if the code could be misread, document the correct
  interpretation explicitly (e.g. "this clear button clears the search, not the item selection")
- **Performance or scale characteristics** — if a function is costly at scale, has a limit, or
  shouldn't be called in a hot path, say so

**Don't document:**
- Trivial getters/setters that are self-explanatory
- Anything already fully clear from the name and type signature
- Implementation details irrelevant to callers

**Format:**
```
One-sentence purpose — what it's *for*, not a mechanical restatement of what it does.

Optional: constraints, when to prefer this over alternatives, side effects, async behaviour,
error conditions, surprising edge cases.

@param name — What it represents, any constraints or format
@returns What the return value means (beyond its type)
@throws Conditions that cause an error
```

**Documenting ambiguity — the most valuable thing you can do:**
- UI components where an action's target is non-obvious
- Functions whose names could mean multiple things
- Parameters with subtle behavioural differences between values
- State that isn't reset when you'd expect it to be
- Behaviour that differs from a similar function elsewhere

**Deprecation notices:**
```ts
/** @deprecated Use `newFunction()` instead — this variant doesn't support X. */
```
Always give a migration path. Note the removal timeline if known.

**Example — bad:**
```ts
/** Gets the user. */
async function getUser(id: string): Promise<User | null> { ... }
```

**Example — good:**
```ts
/**
 * Fetches a user by their UUID from the primary database.
 *
 * Returns null if not found — does not throw. Results are cached for 60s.
 * Pass { bypassCache: true } when you need fresh data after a write.
 *
 * @param id - The user's UUID (not email or username)
 * @returns The user record, or null if not found
 */
```

---

### `AGENTS.md` files: how to write them

**The hierarchical finding tree**

AGENTS.md files form a navigable parent→child graph — the documentation equivalent of `index.ts` for exports. An agent reading the root AGENTS.md should be able to follow links to locate any piece of code, without needing to know the directory layout in advance.

Not every directory warrants its own AGENTS.md. The primary question is not file count — it's whether the directory's purpose or contents would benefit from explanation. A directory with 2–3 complex or non-obvious files absolutely warrants one. A directory with many files almost certainly does. A directory whose files are trivially self-explanatory should just be mentioned inline in the parent rather than given its own file.

Rules for the tree:
- Give a directory its own AGENTS.md when its purpose or internals are non-obvious, or when it has child directories that themselves warrant AGENTS.md files — regardless of file count.
- Trivially self-explanatory directories: describe them in a line or two within the parent — no separate file needed.
- Every AGENTS.md must link to the AGENTS.md of each child directory that has one. Simple directories without their own file are noted inline in the parent's Contents section instead.
- A parent AGENTS.md does not replicate children's content — it briefly describes what each child is for and links to it (or describes it inline if the child is too small for its own file).
- When listing contents (exports, components, hooks, etc.), group by **functional category**, not alphabetically. Category names should answer "what is this for?" not "what letter does it start with?". A consumer should be able to glance at the categories and immediately understand the module's shape.
- The root AGENTS.md (at repo root) is the entry point for the whole tree. It describes the repo's overall shape and links to every top-level directory that has an AGENTS.md.

**Structure:**
```markdown
# Directory/Module Name

One-sentence description of what this module is for and why it exists.

## Overview

2–5 sentences on the role this plays in the larger system. What problem does it solve?
What does it own? What does it *not* own (if non-obvious)?

## Contents

Group by functional category — not alphabetically. Each category has a short header that
explains what unifies the items in it.

### [Category name — e.g. "State management hooks"]
- `ExportName` — what it is and when to use it

### [Category name — e.g. "UI primitives"]
- `ExportName` — what it is and when to use it

## Architecture

[Include only if non-obvious. Data flow, key invariants, lifecycle, ordering constraints.]

## Decision rationale

[Non-obvious architectural or design choices and *why* they were made — not just what was
decided. Include when an agent might otherwise "fix" something intentional.]

## Ambiguities and gotchas

[Anything that would trip up an agent: naming that could be misread, behaviour that differs
from expectations, state that isn't reset when expected, silent failure conditions,
dependencies on initialisation order, known edge cases.]

## Related

- [child-dir/AGENTS.md](./child-dir/AGENTS.md) — what this child directory contains
- [another-child/AGENTS.md](./another-child/AGENTS.md) — what this child directory contains
- [../other-module/AGENTS.md](../other-module/AGENTS.md) — why this module interacts with it
```

---

### Root `README.md`: how to write it

Every repo needs a `README.md`. When writing or updating, cover:

1. **What it is** — one or two sentences
2. **What problem it solves** — the *problem*, not a feature list
3. **Tech stack** — language, frameworks, key dependencies, version constraints
4. **How to use it** — installation, setup, working code examples
5. **Architecture overview** — directory structure, where to start reading (link to `AGENTS.md` files)
6. **Environment variables and configuration** — table format: variable, required, default, description
7. **Known limitations and non-goals** — what it intentionally doesn't do
8. **Errors and what they mean** — error names/codes, what triggers them, what to do
9. **Performance and scale** — operating range, hot-path costs, limits (only if relevant)
10. **Related repos** — how this fits a multi-repo system, with links (only if relevant)
11. **Ambiguities and nuances** — surprising behaviours, integration quirks, things that look wrong but aren't
12. **Troubleshooting** — common problems, cryptic errors explained

When writing and you think "oh, this is important" — ask if a *consumer* of this repo would
also find it important. If yes, put it in the README.

**README template:**
```markdown
# Repo Name

One-sentence description.

## What problem it solves

## Tech stack

## Installation / Setup

## Usage

## Architecture

[Link to relevant AGENTS.md files]

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|

## Known limitations and non-goals

## Errors and what they mean

## Performance and scale

[If relevant]

## Related repos

[If part of a multi-repo system]

## Nuances and gotchas

## Troubleshooting
```

---

### Cross-linking: connect the graph

Documentation should be a navigable graph, not isolated islands. The AGENTS.md hierarchy is the backbone — it forms the "finding tree" for the whole codebase.

**Root → top-level:** The root AGENTS.md lists every top-level directory that has meaningful code, grouped by functional area, each with a link to its AGENTS.md.

**Parent → child (mandatory):** Every AGENTS.md must link to all of its child directories' AGENTS.md files in the Related section. If a child doesn't have an AGENTS.md yet, note it as a gap — don't silently omit it. A missing link breaks the tree.

**Lateral:** If module A interacts with module B, both AGENTS.md files link to each other with a brief note explaining *why* — not just that they're related.

**README → AGENTS.md:** Architecture sections in README link to the root AGENTS.md and any top-level directory AGENTS.md files that are especially relevant to a human getting started.

**Inline cross-references:** In doc comments, reference other functions or modules by name when saying "use X instead of Y" or "see also Z".

When adding any cross-link, check whether the other file needs a reciprocal link back.

---

### Removing stale docs

When code is deleted or renamed:
- Remove or update inline docs that described it
- Update all `AGENTS.md` files that mentioned it
- Update the root `README.md` if it referenced it
- Remove or update cross-links pointing to it

---

### Final checklist

Before finishing, scan:
- [ ] Each inline doc explains *why* and *what it's for*, not just *what it does*
- [ ] All meaningful ambiguities are documented
- [ ] Deprecated items have `@deprecated` with a migration path
- [ ] Performance/scale constraints noted where relevant
- [ ] `AGENTS.md` includes decision rationale for non-obvious choices
- [ ] `AGENTS.md` contents are grouped by functional category, not alphabetically
- [ ] Every directory whose purpose or contents are non-obvious has an `AGENTS.md`; trivially self-explanatory ones are mentioned inline in their parent instead
- [ ] Every `AGENTS.md` links to children that have their own file; simple children are described inline
- [ ] The root `AGENTS.md` links to all top-level directories with meaningful code
- [ ] Root `README.md` covers all applicable sections from the template
- [ ] Cross-links added where modules interact (lateral links, not just parent→child)
- [ ] No information is duplicated — each fact lives in one place; everything else links to it
- [ ] Stale docs removed for anything that changed
- [ ] Could an agent navigate from root AGENTS.md to any file by following links alone?
- [ ] Would a developer reading only the `README.md` know whether and how to use this?
