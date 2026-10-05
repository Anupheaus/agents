---
name: pipeline-auditor
description: Audits, fixes, and creates CI/CD pipelines and build tooling for any platform (GitHub Actions, GitLab CI, Azure Pipelines, CircleCI, Bitbucket Pipelines). Use this skill whenever someone mentions CI, pipelines, workflows, automated testing, automated deployment, continuous integration, continuous delivery, build configuration, pipeline audit, or asks to set up, fix, improve, or review a pipeline — even casually ("can you add CI?", "help me get tests running on PRs", "my pipeline is slow", "add deployment stages", "speed up my CI", "review my build setup", "audit my config"). ALSO trigger when the user asks to "audit" a repo, asks about repo configuration, build tooling, or build setup — phrases like "audit the repo", "audit the config", "audit the build", "audit the pipeline", "run an audit", "do an audit", "check the build config", or similar. Also trigger when the user opens or mentions .github/workflows/, .gitlab-ci.yml, azure-pipelines.yml, .circleci/config.yml, bitbucket-pipelines.yml, webpack.config.js, tsconfig.json, .eslintrc.js, or eslint.config.js.
---

# Pipeline Auditor

Audit the repo's CI pipeline and build tooling, present findings to the user, implement whichever ones they choose, then commit. The first thing you always do is run the checklist below — not start writing YAML.

---

## Master Audit Checklist

Run through every category. Record every item that fails. Items you cannot determine from available files — mark as unknown (don't guess).

### Pipeline structure
- [ ] CI pipeline exists
- [ ] 4-stage structure: Prepare → Validate → Test → Publish
- [ ] Validate and Test run in parallel (not sequentially)
- [ ] Publish is gated — only fires on main/develop push or version tag, never on PRs
- [ ] Publish waits for BOTH Validate and Test to pass

### Pipeline speed
- [ ] Dependencies installed only in Prepare, then cached (not reinstalled per job)
- [ ] Cache key is the lockfile hash (not commit SHA, not a static string)
- [ ] Downstream jobs use `--prefer-offline` after cache restore
- [ ] Shallow clone (`fetch-depth: 1`) used where git history isn't needed
- [ ] Alpine/slim base image used (`node:20-alpine` not `node:20`)
- [ ] E2E tests gated to main/develop only (not every PR)
- [ ] Build output passed via artifact to deploy job (not rebuilt)
- [ ] Step names present on all steps (not bare `run:` commands)

### Security & dependencies
- [ ] Dependabot configured (`.github/dependabot.yml`)
- [ ] `npm audit` / `pnpm audit` in Validate stage
- [ ] Secret detection (TruffleHog or equivalent)
- [ ] SAST (CodeQL, Semgrep, or Trivy)

### Code quality tools
- [ ] Coverage reporting (Codecov or equivalent) in Test stage
- [ ] Bundle/package size tracking (size-limit or BundleMon)

### ESLint
- [ ] `@typescript-eslint/no-explicit-any` is `'warn'` not `'off'`
- [ ] Using `@typescript-eslint/no-unused-vars` (not base `no-unused-vars`)
- [ ] `ecmaVersion` is `'latest'` (not 2019 or older)
- [ ] No deprecated rules: `ban-types`, `no-empty-interface`, `@typescript-eslint/indent`
- [ ] Using shared `ci-templates/eslint/base.js` (not a copy-pasted local config)

### TypeScript config
- [ ] `target` is ES2020 or newer (not ES2015/ES2016/es6)
- [ ] `module` and `moduleResolution` are a valid pair (see Reference)
- [ ] `strict: true`
- [ ] `noUncheckedIndexedAccess: true`
- [ ] `declarationMap: true` (for libraries)
- [ ] `skipLibCheck: true`
- [ ] `removeComments` not set to `true` in libraries (strips JSDoc from .d.ts)

### Bundler / build tooling
- [ ] Library repos use `tsup` not `webpack` + `ts-loader`
- [ ] `circular-dependency-plugin` replaced by `eslint-plugin-import/no-cycle`
- [ ] `TerserPlugin` absent from library builds (consumers minify)
- [ ] `fork-ts-checker-webpack-plugin` replaced by `tsc --noEmit` in CI Validate

### package.json
- [ ] Separate `test:ci` script (no `--watch`) for CI use
- [ ] `engines` field present

### .gitignore
- [ ] `coverage/` excluded
- [ ] `node_modules/` excluded
- [ ] `dist/` excluded (unless repo intentionally commits it)
- [ ] `*.tsbuildinfo` excluded
- [ ] `.env` and `.env.*` excluded (with `!.env.example` exception)
- [ ] `.DS_Store` and `Thumbs.db` excluded

### README badges
- [ ] CI status badge present
- [ ] Coverage badge present (if Codecov configured)
- [ ] Version badge present (if package published)
- [ ] License badge present (if LICENSE file exists)

### ci-templates DRY
- [ ] pnpm setup steps use `Anupheaus/agents/ci-templates/actions/pnpm-setup@v1` (not inline)
- [ ] No workflow pattern duplicated across repos that could live in ci-templates

---

## Workflow

**Step 1 — Gather context**

Read all relevant files in parallel:
- `.github/workflows/*.yml` (or platform equivalent)
- `package.json`, `pnpm-lock.yaml` / `package-lock.json`
- `webpack.config.js` / `tsup.config.ts` / `vite.config.ts`
- `tsconfig.json` + any variants (`tsconfig.build.json` etc.)
- `.eslintrc.js` / `eslint.config.js`
- `README.md`
- `.gitignore`
- `.github/dependabot.yml`

Detect platform from file presence. Detect tech stack from lockfile. Don't ask the user for things you can infer.

**Step 2 — Run the Master Audit Checklist**

Work through every item. Mark pass ✅, fail ❌, or unknown ❓. For fails, note the specific finding (e.g. "cache key uses `$COMMIT_SHA`" not just "cache key is wrong").

**Step 3 — Present findings to the user**

Format as a table:

| Finding | Severity | Recommendation |
|---------|----------|----------------|
| `no-explicit-any` is `'off'` in `.eslintrc.js` | 🔴 High | Change to `'warn'` — `any` erases type guarantees downstream |
| No Dependabot config | 🔴 High | Create `.github/dependabot.yml` |
| ... | | |

**X issues found (Y 🔴 high, Z 🟡 medium, W 🟢 low)**

Then ask: *"Which of these would you like me to fix? I can do all of them, just the high-severity ones, or specific items."*

**Step 4 — Implement selected fixes**

For each selected fix, consult the relevant Reference section below for the correct implementation. Make targeted changes — don't restructure things the user didn't ask to touch. Preserve intentional choices even if they differ from the default recommendation.

**Step 5 — Commit**

See "Committing Changes" reference section below.

---

## Severity Key

- 🔴 **High** — likely causing real bugs, security risk, or significantly hurting performance right now
- 🟡 **Medium** — not a bug today, but a maintenance or reliability risk
- 🟢 **Low** — hygiene / future-proofing

Findings reference tables (with severities and "why it matters" explanations) are in the sections below.

---

---

# Reference Sections

These sections contain the detail needed to check and fix each category. Consult them during Step 2 (checking) and Step 4 (fixing).

---

## Ref: Pipeline Structure

The correct structure for all pipelines:

```
Prepare → Validate → Test → Publish
```

| Stage | Purpose | Runs when |
|-------|---------|-----------|
| **Prepare** | Install dependencies, populate all shared caches | Always |
| **Validate** | Lint, type-check, dep audit, security scan | Always, in parallel with Test |
| **Test** | Unit, integration, E2E tests | Always, in parallel with Validate |
| **Publish** | Deploy, publish to registry, release | Only after BOTH Validate and Test pass |

Key rules:
- Validate and Test start simultaneously after Prepare completes
- Publish is blocked until BOTH Validate AND Test pass
- Publish only fires on the right trigger (branch push, tag, manual)
- PRs must never trigger Publish

**What belongs in Prepare:** package installs, shared tools used by more than one downstream job.
**What does NOT belong in Prepare:** setup used by only one job; things that run faster cold than cached.

**Order within Validate:** cheapest first — lint (seconds) → type-check (seconds to minutes) → security scan (minutes). Never make a fast lint wait behind a slow type-check.

**Publish stage conditions:**
- Push to main/develop → deploy to staging automatically
- Push to version tag (`v*`) → deploy to production (manual approval recommended)
- PRs → never publish

To write the pipeline YAML, consult the platform-specific reference file:
- GitHub Actions → `references/github-actions.md`
- GitLab CI → `references/gitlab-ci.md`
- Azure Pipelines → `references/azure-pipelines.md`
- CircleCI → `references/circleci.md`
- Bitbucket Pipelines → `references/bitbucket-pipelines.md`

---

## Ref: Pipeline Speed

### Cache key rules

```yaml
# Correct — invalidates exactly when deps change
cache-key: hash(package-lock.json)

# Wrong — always cold (new key every commit)
cache-key: $COMMIT_SHA

# Wrong — never invalidates (stale cache forever)
cache-key: "node-cache"
```

### Downstream jobs — prefer-offline

After Prepare warms the cache, downstream jobs should hit local cache first:
```bash
npm ci --prefer-offline      # saves 10–30 seconds per job on warm caches
pnpm install --prefer-offline
```

### Shallow clones

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 1    # only latest commit; use 0 only for changelog/tag-based deploys
```

### Image size

```yaml
image: node:20-alpine    # ~50MB vs ~350MB for node:20
```
Use alpine unless native binaries require glibc.

### E2E gating

```yaml
# GitHub Actions
e2e:
  if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'

# GitLab CI
e2e:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

### Path filters (for repos with large non-code areas)

```yaml
# GitHub Actions
on:
  push:
    paths-ignore:
      - 'docs/**'
      - '*.md'
```

Use carefully — don't exclude paths that could affect test outcomes.

### Test splitting (if tests take >5 minutes)

```yaml
# GitHub Actions — matrix sharding
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npm test -- --shard=${{ matrix.shard }}/${{ strategy.job-total }}
```

---

## Ref: ESLint

### Finding severity table

| Finding | Severity | Why it matters |
|---------|----------|----------------|
| `'@typescript-eslint/no-explicit-any': 'off'` | 🔴 High | Silently disables the most impactful TypeScript safety rule. `any` spreads and erases type guarantees downstream. Set to `'warn'` at minimum. |
| `no-unused-vars` (base rule) instead of `@typescript-eslint/no-unused-vars` | 🔴 High | The base rule doesn't understand TypeScript type-only imports — false positives and missed real cases. |
| `ecmaVersion: 2019` or older | 🟡 Medium | Restricts what syntax ESLint recognises as valid. Should be `'latest'`. |
| `plugin:@typescript-eslint/recommended` without `recommended-type-checked` | 🟡 Medium | Misses async/promise bugs that require type information to detect. |
| Missing `import/no-cycle` | 🟡 Medium | Circular imports cause silent runtime issues. Replaces `circular-dependency-plugin`. Requires `eslint-plugin-import`. |
| `@typescript-eslint/no-floating-promises` not enabled | 🟡 Medium | Unawaited promises silently swallow errors. Requires `recommended-type-checked`. |
| Deprecated rules still referenced: `ban-types`, `no-empty-interface`, `@typescript-eslint/indent` | 🟢 Low | Deprecated in typescript-eslint v7+ — will warn on upgrade. Safe to remove/turn off now. |
| Legacy `.eslintrc.js` format (not `eslint.config.js`) | 🟢 Low | Deprecated in ESLint 9. Can continue working but migration is worthwhile. |
| Config not using `ci-templates/eslint/base.js` | 🟢 Low | Duplicated config drifts across repos. |

### Shared config (Anupheaus repos)

All Anupheaus repos should use the shared config from `ci-templates`:
- `ci-templates/eslint/base.js` — all TypeScript repos
- `ci-templates/eslint/react.js` — React/TSX repos (extends base)

```js
// .eslintrc.js — TypeScript repo
const base = require('../../agents/ci-templates/eslint/base');
module.exports = {
  ...base,
  rules: {
    ...base.rules,
    // repo-specific overrides only
  },
};

// .eslintrc.js — React repo
const react = require('../../agents/ci-templates/eslint/react');
module.exports = { ...react, rules: { ...react.rules } };
```

### Type-aware linting

`recommended-type-checked` catches async/type bugs that `recommended` misses, but requires `parserOptions.project: true`. For large repos this slows lint — mitigate with `parserOptions.tsconfigRootDir`.

---

## Ref: TypeScript Config

### Finding severity table

| Finding | Severity | Why it matters |
|---------|----------|----------------|
| `target: "ES2015"` / `"es6"` / `"ES2016"` / `"ES2017"` / `"ES2018"` / `"ES2019"` | 🔴 High | Very old targets — should be ES2020+ for Node 16+. |
| `moduleResolution: "node"` with `module: "ESNext"` | 🔴 High | Mismatched pair — `node` resolution doesn't understand package `exports` fields. Use `"bundler"` or `"node16"`. |
| `strict: false` or `strict` absent | 🔴 High | Disables 8 checks at once including `noImplicitAny` and `strictNullChecks`. |
| `noUnusedLocals` / `noUnusedParameters` not enabled | 🟡 Medium | Dead code accumulates silently. |
| `noUncheckedIndexedAccess` not set | 🟡 Medium | `array[i]` returns `T` not `T \| undefined` — masks many real bugs. |
| `isolatedModules` not set (when using esbuild/tsup/SWC) | 🟡 Medium | Single-file transpilers require this. |
| `lib` includes `DOM` in a pure Node.js repo | 🟡 Medium | Pollutes types — `window`, `document` appear valid when they aren't. |
| `declarationMap: true` missing in a library | 🟡 Medium | Consumers' "Go to definition" jumps to `.d.ts` instead of source. |
| `skipLibCheck: false` or absent | 🟢 Low | Type-checks all `.d.ts` in `node_modules` — slow and rarely catches real issues. |
| `removeComments: true` in a library | 🟢 Low | Strips JSDoc from `.d.ts` output — consumers lose hover docs. |

### Valid module/moduleResolution pairs

| Scenario | `module` | `moduleResolution` |
|----------|----------|-------------------|
| Code consumed by a bundler (Vite, webpack, tsup) | `ESNext` | `bundler` |
| Code running directly in Node 16+ | `Node16` | `Node16` |
| CommonJS library | `CommonJS` | `node` |

### Modern baseline (TypeScript library, 2025)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

Add `"jsx": "react-jsx"` and `"lib": ["ES2022", "DOM"]` for React libraries.

### Shared tsconfig (Anupheaus repos)

```json
// tsconfig.json — Node.js library
{ "extends": "../../agents/ci-templates/tsconfig/node-library.json" }

// tsconfig.json — React library
{ "extends": "../../agents/ci-templates/tsconfig/react-library.json" }
```

---

## Ref: Bundler / Build Tooling

### Finding severity table

| Finding | Severity | Why it matters |
|---------|----------|----------------|
| Library using `webpack` + `ts-loader` | 🔴 High | `ts-loader` does a full type-check on every build — 5-60x slower than esbuild. `tsup` replaces both with zero config. |
| `circular-dependency-plugin` in webpack | 🟡 Medium | Duplicates what `eslint-plugin-import/no-cycle` does at lint time with no build overhead. |
| `TerserPlugin` on a library | 🟡 Medium | Consumers minify their own bundles. Minifying a library makes stack traces unreadable. |
| `fork-ts-checker-webpack-plugin` | 🟡 Medium | Added to get async type-checking — simpler to run `tsc --noEmit` as a separate CI step. |
| Build script runs both `webpack` and `tsc` | 🟡 Medium | `tsup` with `dts: true` replaces both in one pass. |
| `webpack-node-externals` in a library | 🟢 Low | Correct choice for webpack, but not needed with tsup (`external: []`). |

### Repo type classification

| Type | Signs | Recommended bundler |
|------|-------|---------------------|
| **Library** (published to registry) | `nodeExternals()`, `libraryTarget: 'umd'`, no dev server | `tsup` |
| **App** (served to users) | `HtmlWebpackPlugin`, dev server, `devServer:` config | `Vite` |
| **Node.js server** | `target: 'node'`, no DOM, no browser output | `tsup` or `esbuild` directly |

### tsup migration for a webpack library

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,          // replaces tsc for declarations
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [],       // replaces webpack-node-externals
});
```

What this replaces: `ts-loader` (esbuild is 10-100x faster), `webpack-node-externals`, `TerserPlugin` (`minify: true`), `source-map-loader`, separate `tsc --emitDeclarationOnly` step.

Shared tsup config: `import { createLibraryConfig } from '../../agents/ci-templates/tsup/library';`

### Circular dependency detection without webpack

`eslint-plugin-import` + `import/no-cycle` — runs at lint time, zero build overhead:
```json
{ "rules": { "import/no-cycle": ["warn", { "maxDepth": 5 }] } }
```

**For apps that need webpack:** consider **Rspack** as a drop-in replacement — same config format, 5-10x faster, written in Rust.

### Webpack plugin audit

For each plugin, ask: is there a simpler alternative that doesn't require webpack?

| Plugin | Common issue | Better alternative |
|--------|-------------|-------------------|
| `ts-loader` | Full type-check on every build | `swc-loader` or drop webpack for `tsup` |
| `fork-ts-checker-webpack-plugin` | Complex async type-check | `tsc --noEmit` in CI Validate job |
| `circular-dependency-plugin` | webpack-only | `eslint-plugin-import/no-cycle` |
| `TerserPlugin` | Only needed for apps | Built into tsup; skip for libraries |
| `source-map-loader` | Loads dep source maps | Rarely needed |
| `webpack-node-externals` | Marks node_modules external | `external: [...]` in tsup |
| `HtmlWebpackPlugin` | Generates HTML | Built into Vite |
| `MiniCssExtractPlugin` | Extracts CSS | Built into Vite |

---

## Ref: package.json

| Finding | Severity | Why it matters |
|---------|----------|----------------|
| No `test:ci` script (separate from `test`) | 🟡 Medium | `test` often has `--watch` which hangs CI. CI needs a one-shot command. |
| `typescript` pinned to exact version (no `^`) | 🟢 Low | Prevents patch-level improvements. Use `^5.x.x`. |
| No `engines` field | 🟢 Low | Consumers can't tell what Node version is required. |

---

## Ref: Security & Free Tools

All of these are free for at least some repo types. Check which are already in the pipeline — flag any that aren't.

### SAST

| Tool | What it does | Free for |
|------|-------------|----------|
| **CodeQL** | Deep code analysis (JS/TS natively) | Public repos; private needs GHAS |
| **Semgrep** | Pattern-based SAST, 1000+ rules | Public + private (≤10 contributors) |
| **Trivy** | Filesystem, container, secret, IaC scanning | All repos, no account |

```yaml
# CodeQL — add to Validate job
- uses: github/codeql-action/init@v3
  with: { languages: javascript-typescript }
- uses: github/codeql-action/autobuild@v3
- uses: github/codeql-action/analyze@v3
  with: { upload: true }
```

Recommendation: public repo → CodeQL; private repo → Trivy (no limits, no account).

### Secret detection

| Tool | Free for |
|------|----------|
| **TruffleHog** | All repos, no account — 800+ secret types |
| **GitHub Secret Scanning** | Public repos only; private needs GHAS |

```yaml
- uses: trufflesecurity/trufflehog@main
  with:
    base: ${{ github.event.repository.default_branch }}
    head: HEAD
    extra_args: --only-verified
```

### Dependency scanning

| Tool | What it does | Free for |
|------|-------------|----------|
| **Dependabot** | Automated PRs for vulnerable/outdated deps | All repos — always add this |
| **npm/pnpm audit** | Advisory database scan | All repos, built-in |
| **Trivy** | Deep SCA + license scanning | All repos |

Dependabot requires `.github/dependabot.yml` — not a pipeline step:
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      production-dependencies:
        dependency-type: production
      development-dependencies:
        dependency-type: development
```

### Coverage

| Tool | Free for |
|------|----------|
| **Codecov** | Public (unlimited); private (1 user, 250 uploads/month) |
| **Coveralls** | Public repos only |

```yaml
- uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    fail_ci_if_error: false
```

Requires test runner coverage output (e.g. `vitest run --coverage`, `jest --coverage`).

### Code quality & size

| Tool | Free for |
|------|----------|
| **SonarQube Cloud** | Public + small private repos |
| **size-limit** | All repos — PR size diff comments |
| **BundleMon** | All repos — size tracking over time |

```yaml
# size-limit
- uses: andresz1/size-limit-action@v1
  with: { github_token: ${{ secrets.GITHUB_TOKEN }} }
```

### License compliance

```yaml
- run: npx license-checker --onlyAllow 'MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause' --production
```

---

## Ref: README Badges

Read `README.md` first — never duplicate a badge that's already there.

| Badge | Add when | URL pattern |
|-------|----------|-------------|
| **CI** | Always | `https://github.com/ORG/REPO/actions/workflows/FILE.yml/badge.svg` |
| **Coverage** | Codecov configured | `https://codecov.io/gh/ORG/REPO/branch/main/graph/badge.svg` |
| **Version** | Package published to GitHub Packages or npm | `https://img.shields.io/github/v/tag/ORG/REPO?label=version` |
| **License** | `LICENSE` file exists | `https://img.shields.io/github/license/ORG/REPO` |
| **Language** | Library/tool where language matters | `https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript` |

Finding severity:

| Finding | Severity |
|---------|----------|
| No CI badge | 🟡 Medium |
| No coverage badge (when Codecov configured) | 🟡 Medium |
| No version badge (published package) | 🟢 Low |
| No license badge (LICENSE file present) | 🟢 Low |

Place badges at the top of README, before the title or immediately below it.

---

## Ref: .gitignore

| Finding | Severity | Why it matters |
|---------|----------|----------------|
| `.gitignore` absent | 🔴 High | Everything below is unprotected. |
| `coverage/` absent | 🔴 High | Regenerated every test run, often hundreds of files, already uploaded to Codecov. Never commit. |
| `node_modules/` absent | 🔴 High | Lockfile is the source of truth. Never commit node_modules. |
| `.env` / `.env.*` absent | 🔴 High | Secrets must never be committed. |
| `dist/` absent (apps and non-publishing libraries) | 🟡 Medium | Reproducible from source. Creates noisy diffs. |
| `*.tsbuildinfo` absent | 🟡 Medium | Machine-specific incremental TS cache — no value in source control. |
| `.npm/` absent | 🟢 Low | Local package manager cache. |
| `.DS_Store` / `Thumbs.db` absent | 🟢 Low | OS noise in diffs. |

Correct `.gitignore` baseline:
```
node_modules/
dist/
coverage/
*.tsbuildinfo
.npm/
.env
.env.*
!.env.example
*.log
.DS_Store
Thumbs.db
```

---

## Ref: ci-templates DRY

| Finding | Severity | Why it matters |
|---------|----------|----------------|
| Checkout + pnpm + node + cache inline (not using `pnpm-setup` action) | 🟡 Medium | `Anupheaus/agents/ci-templates/actions/pnpm-setup@v1` does this in one line. Inline copies drift. |
| Workflow pattern duplicated across multiple repos | 🟡 Medium | Diverges independently. Template belongs in `ci-templates/github-actions/`. |

Currently available in the `ci-templates/` folder of `github.com/Anupheaus/agents` (cloned at `c:/code/personal/agents/ci-templates`):
- `actions/pnpm-setup` — checkout + pnpm + node (GitHub Packages) + store cache + install. Inputs: `pnpm-version`, `node-version`, `install-args`, `node-auth-token`, `fetch-depth`, `patch-package-json`.
- `github-actions/publish-node-pkg.yml` — full 4-stage workflow template for Node.js packages published to GitHub Packages.
- `eslint/base.js`, `eslint/react.js` — shared ESLint configs.
- `tsconfig/base.json`, `tsconfig/node-library.json`, `tsconfig/react-library.json` — shared tsconfig bases.
- `tsup/library.ts` — `createLibraryConfig()` factory.

**To add something to ci-templates:**
1. Create/update the file in `c:/code/personal/agents/ci-templates/`
2. `git commit`, `git push origin master` (in the `agents` repo)
3. `git tag -f v1 && git push origin v1 --force`

See `references/global-config.md` for the full ci-templates reference.

---

## Ref: Committing Changes

### Before staging — fix .gitignore first

Add any missing entries from the `.gitignore` baseline above. Do not remove existing entries, only add. If `.gitignore` didn't exist, create it.

### Stage only intended files

Run `git status` and review. Never stage:
- `node_modules/`, `coverage/`, `.env`, any file containing secrets
- `dist/` unless the repo intentionally publishes it (check `package.json` `files` field)
- Any file not touched as part of this job

### Commit message

```
chore(ci): add GitHub Actions pipeline, dependabot, and README badges

- 4-stage pipeline: Prepare → Validate → Test → Publish
- pnpm-setup composite action from ci-templates
- Dependabot weekly updates for npm
- CI, coverage, and version badges added to README
```

Scope conventions: `chore(ci):` for pipeline/workflow changes, `chore(build):` for bundler/tsconfig/ESLint changes. If both, use two commits.

**If ci-templates was modified:** commit and push the `agents` repo first, move its `v1` tag, then commit the consuming repo.

---

## Principles

**Report everything, fix what's asked.** The audit surfaces all findings. The user decides the scope of fixes. Don't silently skip findings because fixing them seems out of scope.

**Speed is a primary objective.** A 10-minute pipeline gets worked around. A 2-minute pipeline gets used. Cache aggressively, parallelize, cut anything that can be cut.

**DRY reduces drift.** Duplicated setup gets updated in some places and not others. Centralise in Prepare — and for cross-repo duplication, in ci-templates.

**Secrets are security.** Hardcoded credentials → replace with secret references. Always.

**Badges surface health.** A README without CI badges hides failures. Always check for them.

**Preserve intent.** If a setting looks wrong but might be deliberate (e.g. `failOnError: false`), flag it and ask rather than changing it silently.
