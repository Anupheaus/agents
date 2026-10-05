# ci-templates

Shared CI/CD pipeline components for all Anupheaus repos. Lives in the `agents` repo (formerly the standalone `Anupheaus/ci-templates` repo).

## Composite Actions

### `Anupheaus/agents/ci-templates/actions/pnpm-setup@v1`

Handles the full pnpm setup sequence used in every job across all repos:
checkout → pnpm install → Node.js setup (GitHub Packages registry) → pnpm store cache restore → dependency install.

**Inputs:**

| Input | Default | Description |
|-------|---------|-------------|
| `pnpm-version` | `10` | pnpm version |
| `node-version` | `22` | Node.js version |
| `install-args` | `--frozen-lockfile` | Extra args for `pnpm install` |
| `node-auth-token` | `''` | Token for npm.pkg.github.com |
| `fetch-depth` | `1` | Git fetch depth (use `0` for full history) |
| `patch-package-json` | `false` | Strip `@anupheaus/*` local overrides from pnpm.overrides |

**Example:**
```yaml
- uses: Anupheaus/agents/ci-templates/actions/pnpm-setup@v1
  with:
    pnpm-version: '10'
    node-version: '22'
    node-auth-token: ${{ secrets.GITHUB_TOKEN }}
    install-args: '--no-frozen-lockfile'
    patch-package-json: 'true'
```

## Workflow Templates

### `github-actions/publish-node-pkg.yml`

Full 4-stage pipeline (Prepare → Validate → Test → Publish) for Node.js packages published to GitHub Packages. Copy to `.github/workflows/publish.yml` and fill in the `CONFIGURE` comments.

## Adding to repos

When any setup step appears in more than one job across a repo's workflow, it belongs here. Raise a PR against `agents` to add or update templates; move the `agents` repo's version tag after merging.

## Versioning

Tags follow `v<major>` (e.g. `v1`, `v2`). Consuming repos pin to a major version tag — they get non-breaking improvements automatically.
