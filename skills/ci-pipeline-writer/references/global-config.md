# Shared Pipeline Config — Free Hosting Guide

When multiple repos need the same pipeline structure, centralise it in the `ci-templates/` folder of the public `agents` GitHub repository and serve the files over the internet for platforms that support URL-based includes.

---

## The Anupheaus Setup

Shared CI config lives in the `ci-templates/` folder of `github.com/Anupheaus/agents` (cloned at `c:/code/personal/agents/ci-templates`).

### Current contents

```
agents/ci-templates/
├── actions/
│   └── pnpm-setup/
│       └── action.yml        ← composite action: checkout+pnpm+node+cache+install
├── eslint/                   ← shared ESLint configs (base, react)
├── github-actions/
│   └── publish-node-pkg.yml  ← full 4-stage workflow template
├── tsconfig/                 ← shared tsconfig bases
├── tsup/                     ← shared tsup config factory
└── README.md
```

### Adding new shared config

1. Add files at `c:/code/personal/agents/ci-templates/`
2. Commit and push the `agents` repo (`master`)
3. Move the `v1` tag forward: `git tag -f v1 && git push origin v1 --force`
4. Update consuming repos to use `@v1`

---

## URL Options by Platform

### Option A — GitHub composite action / reusable workflow (GitHub Actions)

No CDN needed. Reference directly:
```yaml
uses: Anupheaus/agents/ci-templates/actions/pnpm-setup@v1
```
or for full reusable workflows (GitHub requires these at the repo root's `.github/workflows/`):
```yaml
uses: Anupheaus/agents/.github/workflows/ci.yml@v1
```

### Option B — jsDelivr CDN (for GitLab, Azure, CircleCI remote includes)

jsDelivr serves raw GitHub file content at CDN speed, with versioning:
```
https://cdn.jsdelivr.net/gh/Anupheaus/agents@v1/ci-templates/PATH/TO/FILE.yml
```

**Why jsDelivr over raw.githubusercontent.com:**
- Global CDN — faster, especially outside the US
- Proper caching headers (GitHub raw may be throttled)
- Versioned by tag — stable, predictable URL
- Free with no rate limits for public repos

### Option C — raw.githubusercontent.com (simpler alternative)

```
https://raw.githubusercontent.com/Anupheaus/agents/v1/ci-templates/PATH/TO/FILE.yml
```

Fine for low traffic / internal use.

---

## Per-Platform Usage

### GitLab CI — `include: remote:`

```yaml
include:
  - remote: 'https://cdn.jsdelivr.net/gh/Anupheaus/agents@v1/ci-templates/gitlab/base.yml'

# Or for repos on the same GitLab instance:
include:
  - project: 'Anupheaus/agents'
    ref: v1
    file: '/ci-templates/gitlab/base.yml'
```

### GitHub Actions — native (no CDN needed)

```yaml
- uses: Anupheaus/agents/ci-templates/actions/pnpm-setup@v1
  with:
    node-auth-token: ${{ secrets.GITHUB_TOKEN }}
```

### Azure Pipelines — `extends:` template

```yaml
resources:
  repositories:
    - repository: templates
      type: github
      name: Anupheaus/agents
      ref: refs/tags/v1
      endpoint: github-service-connection

extends:
  template: ci-templates/azure/stages.yml@templates
```

---

## Versioning

Use major-version tags (`v1`, `v2`). Consumers get non-breaking improvements automatically. When making a breaking change, bump to `v2`.

To move a tag forward after a fix:
```bash
git tag -f v1
git push origin v1 --force
```
