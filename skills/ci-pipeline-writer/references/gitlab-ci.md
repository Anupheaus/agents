# GitLab CI — Pipeline Reference

## Full 4-Stage Template (Node.js)

```yaml
stages:
  - prepare
  - check      # validate + test run here in parallel
  - build
  - publish

default:
  image: node:20-alpine
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
      - .npm/
    policy: pull    # downstream jobs only pull; prepare pushes

# ── PREPARE ─────────────────────────────────────────────────────────────────
install:
  stage: prepare
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
      - .npm/
    policy: push
  script:
    - npm ci --cache .npm --prefer-offline

# ── VALIDATE ─────────────────────────────────────────────────────────────────
lint:
  stage: check
  needs: [install]
  script:
    - npm run lint
    - npm run typecheck

audit:
  stage: check
  needs: [install]
  script:
    - npm audit --audit-level=high

# ── TEST ─────────────────────────────────────────────────────────────────────
test:
  stage: check
  needs: [install]
  script:
    - npm test
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

e2e:
  stage: check
  needs: [install]
  rules:
    - if: $CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "develop"
  script:
    - npm run test:e2e

# ── BUILD ─────────────────────────────────────────────────────────────────────
build:
  stage: build
  needs: [lint, audit, test]
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

# ── PUBLISH ──────────────────────────────────────────────────────────────────
deploy-staging:
  stage: publish
  needs: [build]
  environment:
    name: staging
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  script:
    - ./deploy.sh staging

deploy-production:
  stage: publish
  needs: [build]
  environment:
    name: production
  rules:
    - if: $CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/
  when: manual
  script:
    - ./deploy.sh production
```

---

## Cache Policies

```yaml
# Prepare job — pushes the warm cache
install:
  cache:
    policy: push
  script:
    - npm ci --cache .npm --prefer-offline

# All downstream jobs — only pull (read-only, faster)
default:
  cache:
    policy: pull
```

Without `policy: pull`, every job re-uploads the cache on completion, wasting time.

---

## DAG with `needs:`

Use `needs:` to express direct dependencies and skip the stage queue:
```yaml
test:
  stage: check
  needs: [install]    # starts as soon as install finishes, regardless of other jobs
```

---

## Rules Patterns

```yaml
# Only on main branch pushes (not MRs)
rules:
  - if: $CI_COMMIT_BRANCH == "main" && $CI_PIPELINE_SOURCE == "push"

# Only on version tags
rules:
  - if: $CI_COMMIT_TAG =~ /^v\d+/

# Skip for docs-only changes
rules:
  - changes:
      - docs/**
      - '*.md'
    when: never
  - when: on_success
```

---

## Shared Templates via Remote Include

```yaml
include:
  - remote: 'https://cdn.jsdelivr.net/gh/Anupheaus/ci-templates@v1/gitlab/base.yml'

# Or for repos on the same GitLab instance:
include:
  - project: 'Anupheaus/ci-templates'
    ref: v1
    file: '/gitlab/base.yml'
```

---

## Key Rules

- Use `node:20-alpine` — ~50MB vs ~350MB
- Set `policy: push` on prepare, `policy: pull` on all downstream jobs
- Use `needs:` to enable DAG execution
- `expire_in` on artifacts to avoid storage bloat
- `when: manual` on production deploys
