# Bitbucket Pipelines — Pipeline Reference

## Full 4-Stage Template (Node.js)

```yaml
image: node:20-alpine

definitions:
  caches:
    npm: ~/.npm

  steps:
    - step: &install
        name: Prepare — Install dependencies
        caches: [npm]
        script:
          - npm ci --prefer-offline

    - step: &lint
        name: Validate — Lint & type-check
        caches: [npm]
        script:
          - npm ci --prefer-offline
          - npm run lint
          - npm run typecheck

    - step: &audit
        name: Validate — Security audit
        caches: [npm]
        script:
          - npm ci --prefer-offline
          - npm audit --audit-level=high

    - step: &test
        name: Test — Unit & integration
        caches: [npm]
        script:
          - npm ci --prefer-offline
          - npm test
        artifacts:
          - coverage/**

    - step: &build
        name: Build
        caches: [npm]
        script:
          - npm ci --prefer-offline
          - npm run build
        artifacts:
          - dist/**

pipelines:
  default:
    - step: *install
    - parallel:
        - step: *lint
        - step: *audit
        - step: *test
    - step: *build

  branches:
    main:
      - step: *install
      - parallel:
          - step: *lint
          - step: *audit
          - step: *test
      - step: *build
      - step:
          name: Publish — Deploy to staging
          deployment: staging
          script:
            - ./deploy.sh staging

  tags:
    'v*':
      - step: *install
      - parallel:
          - step: *lint
          - step: *audit
          - step: *test
      - step: *build
      - step:
          name: Publish — Deploy to production
          deployment: production
          trigger: manual
          script:
            - ./deploy.sh production
```

---

## YAML Anchors — DRY mechanism for Bitbucket

Bitbucket has no `include: remote:`. YAML anchors are the primary DRY tool:
```yaml
definitions:
  steps:
    - step: &setup           # define once
        caches: [npm]
        script: [npm ci --prefer-offline]

# Reference anywhere:
    - step:
        <<: *setup           # inherit all fields
        name: Custom name    # override just this field
```

---

## Caches vs Artifacts

| | Caches | Artifacts |
|---|---|---|
| **Purpose** | Reuse downloaded dependencies across steps | Pass build outputs to later steps |
| **Scope** | Persists across pipeline runs | Only within current pipeline run |

---

## Key Rules

- Anchors must be in `definitions:` before use
- `trigger: manual` pauses until a human clicks "Run" in Bitbucket UI
- `artifacts:` are required to pass build output (`dist/`) to later steps
- `parallel:` block: all steps start together, next step waits for all to pass
- Use `node:20-alpine` to minimise container startup time
