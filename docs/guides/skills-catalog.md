# Personal skills catalog

> The personal skills in this repo, when to invoke each, where the skill files live and how to add one.
>
> Status: accepted · Version 1

Personal skills live in `skills/<name>/` in this repo and are copied to `~/.claude/skills/` for Claude Code. Each `SKILL.md` holds the full instructions; this catalog says when to invoke it.

| Skill | Invoke when | File |
|---|---|---|
| test-design | Writing, adding or fixing tests; implementing a feature or bug fix; auditing tests or coverage | `skills/test-design/skill.md` |
| debugger | Any bug or unexpected behaviour, before reasoning about causes | `skills/debugger/SKILL.md` |
| documentation-writer | Code is added, changed or deleted, or documentation is mentioned | `skills/documentation-writer/SKILL.md` |
| ci-pipeline-writer | CI, pipelines, workflows or build tooling are mentioned, or `.github/workflows/`, `tsconfig.json`, lint configs are edited | `skills/ci-pipeline-writer/SKILL.md` |

## Project skills

Skills for one project live in that repo's `.claude/skills/` instead. Vision's three — `implementing-a-vision-epic`, `implementing-a-vision-ticket`, `refining-vision-work` — are in `vision/.claude/skills/` and apply to the Shortcut workspace.

## Adding a skill

1. Create `skills/<skill-name>/SKILL.md` with name, description and instructions.
2. Add it to this catalog and reference it from `agents.md` if needed.
3. Copy or symlink it into `~/.claude/skills/`.
