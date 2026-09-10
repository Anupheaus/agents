# Azure Pipelines — Pipeline Reference

## Full 4-Stage Template (Node.js)

```yaml
trigger:
  branches:
    include: [main, develop]
  tags:
    include: ['v*']
  paths:
    exclude: [docs/**, '*.md']

pool:
  vmImage: ubuntu-latest

variables:
  NODE_VERSION: '20.x'
  npm_config_cache: $(Pipeline.Workspace)/.npm

stages:
  - stage: Prepare
    jobs:
      - job: Install
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(NODE_VERSION)
          - task: Cache@2
            inputs:
              key: 'npm | "$(Agent.OS)" | package-lock.json'
              restoreKeys: 'npm | "$(Agent.OS)"'
              path: $(npm_config_cache)
          - script: npm ci --prefer-offline

  - stage: Validate
    dependsOn: Prepare
    jobs:
      - job: Lint
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(NODE_VERSION)
          - task: Cache@2
            inputs:
              key: 'npm | "$(Agent.OS)" | package-lock.json'
              restoreKeys: 'npm | "$(Agent.OS)"'
              path: $(npm_config_cache)
          - script: npm ci --prefer-offline
          - script: npm run lint
          - script: npm run typecheck
          - script: npm audit --audit-level=high

  - stage: Test
    dependsOn: Prepare
    jobs:
      - job: UnitTest
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(NODE_VERSION)
          - task: Cache@2
            inputs:
              key: 'npm | "$(Agent.OS)" | package-lock.json'
              restoreKeys: 'npm | "$(Agent.OS)"'
              path: $(npm_config_cache)
          - script: npm ci --prefer-offline
          - script: npm test
          - task: PublishTestResults@2
            inputs:
              testResultsFormat: JUnit
              testResultsFiles: 'test-results/*.xml'

  - stage: Publish
    dependsOn: [Validate, Test]
    condition: and(succeeded('Validate'), succeeded('Test'), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: Deploy
        environment: staging
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo "Deploy to staging"
```

---

## Key Rules

- Both Validate and Test must have `dependsOn: Prepare` — they run in parallel
- Publish must list BOTH `[Validate, Test]` in `dependsOn` and `condition`
- Use `deployment:` job type for deploy steps — unlocks environments and approvals
- Cache the npm store (`~/.npm`), not `node_modules` — more portable across agents
- Store secrets in Variable Groups (Library), never inline
