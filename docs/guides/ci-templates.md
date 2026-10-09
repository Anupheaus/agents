# Shared CI templates

> The shared pnpm-setup composite action and publish workflow template in ci-templates, and how repos pin to them.
>
> Status: accepted · Version 1

Shared CI/CD components for all Anupheaus repos, kept in `ci-templates/` in this repo (formerly the standalone `Anupheaus/ci-templates` repo).

## Composite action: pnpm-setup

`Anupheaus/agents/ci-templates/actions/pnpm-setup@v1` runs the whole setup sequence used in every job: checkout, pnpm install, Node.js setup against the GitHub Packages registry, pnpm store cache restore, dependency install.

| Input | Default | Description |
|---|---|---|
| `pnpm-version` | `10` | pnpm version |
| `node-version` | `22` | Node.js version |
| `install-args` | `--frozen-lockfile` | Extra args for `pnpm install` |
| `node-auth-token` | `''` | Token for `npm.pkg.github.com` |
| `fetch-depth` | `1` | Git fetch depth; `0` for full history |
| `patch-package-json` | `false` | Strip `@anupheaus/*` local overrides from `pnpm.overrides` |

```yaml
- uses: Anupheaus/agents/ci-templates/actions/pnpm-setup@v1
  with:
    node-auth-token: ${{ secrets.GITHUB_TOKEN }}
    patch-package-json: 'true'
```

## Workflow template

`github-actions/publish-node-pkg.yml` is a four-stage pipeline (Prepare, Validate, Test, Publish) for Node packages published to GitHub Packages. Copy it to `.github/workflows/publish.yml` and fill in the `CONFIGURE` comments.

## Rules

- Any setup step that appears in more than one job of a repo's workflow belongs here. Raise a PR against `agents` to change a template.
- Tags are `v<major>` (`v1`, `v2`); consuming repos pin to a major tag to receive non-breaking improvements.
