# GitHub Actions — Pipeline Reference

## Full 4-Stage Template (pnpm / Node.js — Anupheaus style)

Uses the shared `pnpm-setup` composite action from `ci-templates`:

```yaml
name: CI

on:
  push:
    branches: [master]
  workflow_dispatch:

env:
  PNPM_VERSION: '10'
  NODE_VERSION: '22'

jobs:
  # ── PREPARE ─────────────────────────────────────────────────────────────────
  Prepare:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: read
    steps:
      - uses: Anupheaus/ci-templates/.github/actions/pnpm-setup@v1
        with:
          pnpm-version: ${{ env.PNPM_VERSION }}
          node-version: ${{ env.NODE_VERSION }}
          node-auth-token: ${{ secrets.GITHUB_TOKEN }}

  # ── VALIDATE ─────────────────────────────────────────────────────────────────
  Validate:
    needs: Prepare
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: read
    steps:
      - uses: Anupheaus/ci-templates/.github/actions/pnpm-setup@v1
        with:
          pnpm-version: ${{ env.PNPM_VERSION }}
          node-version: ${{ env.NODE_VERSION }}
          node-auth-token: ${{ secrets.GITHUB_TOKEN }}
          install-args: '--no-frozen-lockfile'
      - run: pnpm run typecheck
      - run: pnpm run lint
      - run: pnpm audit --audit-level=high

  # ── TEST ─────────────────────────────────────────────────────────────────────
  Test:
    needs: Prepare
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: read
    steps:
      - uses: Anupheaus/ci-templates/.github/actions/pnpm-setup@v1
        with:
          pnpm-version: ${{ env.PNPM_VERSION }}
          node-version: ${{ env.NODE_VERSION }}
          node-auth-token: ${{ secrets.GITHUB_TOKEN }}
          install-args: '--no-frozen-lockfile'
      - run: pnpm run test:ci

  # ── PUBLISH ──────────────────────────────────────────────────────────────────
  Publish:
    needs: [Validate, Test]
    runs-on: ubuntu-latest
    if: github.repository_owner == 'Anupheaus'
    permissions:
      contents: write
      packages: write
    steps:
      - uses: Anupheaus/ci-templates/.github/actions/pnpm-setup@v1
        with:
          pnpm-version: ${{ env.PNPM_VERSION }}
          node-version: ${{ env.NODE_VERSION }}
          node-auth-token: ${{ secrets.GITHUB_TOKEN }}
          install-args: '--no-frozen-lockfile'
          fetch-depth: '0'
      - run: pnpm run build
      - uses: phips28/gh-action-bump-version@master
        with:
          commit-message: 'CI: bumps version to {{version}} [skip ci]'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - run: pnpm pack
      - run: pnpm publish $(ls *.tgz) --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Repos with local @anupheaus/* overrides (react-ui style)

If the repo has `pnpm.overrides` pointing to local workspace paths, add `patch-package-json: 'true'` to strip them before CI install, and pass the patched `package.json` between jobs via artifact:

```yaml
  Prepare:
    steps:
      - uses: Anupheaus/ci-templates/.github/actions/pnpm-setup@v1
        with:
          patch-package-json: 'true'
          install-args: '--no-frozen-lockfile'
          node-auth-token: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/upload-artifact@v4
        with:
          name: package-json
          path: package.json
          retention-days: 1

  Validate:
    needs: Prepare
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: package-json
      - uses: Anupheaus/ci-templates/.github/actions/pnpm-setup@v1
        with:
          install-args: '--no-frozen-lockfile'
          node-auth-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## Caching Patterns

### pnpm (preferred)
The `pnpm-setup` action handles this automatically — pnpm store keyed on `pnpm-lock.yaml` hash.

### npm
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'            # caches ~/.npm keyed on package-lock.json hash
- run: npm ci --prefer-offline
```

### Docker layers
```yaml
- uses: docker/setup-buildx-action@v3
- uses: docker/build-push-action@v6
  with:
    push: false
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

---

## Test Splitting (large test suites)

```yaml
test:
  strategy:
    matrix:
      shard: [1, 2, 3, 4]
  steps:
    - run: npx vitest run --shard=${{ matrix.shard }}/${{ strategy.job-total }}
```

---

## Deployment Stages (staging + production)

```yaml
  deploy-staging:
    needs: [Validate, Test]
    environment: staging
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist

  deploy-production:
    needs: [Validate, Test]
    environment: production   # set up approvals in GitHub Environments settings
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
```

---

## Key Rules

- Use `pnpm install --no-frozen-lockfile --prefer-offline` in CI (frozen lockfile fails when package.json was patched)
- Pin action versions to semver tags (not `@master`)
- Use `environment:` on deploy jobs to get GitHub's manual approval gates
- `fetch-depth: '0'` only when the Publish job needs full git history (version bump)
- Always add `if: github.repository_owner == 'Anupheaus'` on Publish to prevent forks from publishing
