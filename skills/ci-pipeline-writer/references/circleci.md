# CircleCI — Pipeline Reference

## Full 4-Stage Template (Node.js)

```yaml
version: 2.1

executors:
  node:
    docker:
      - image: cimg/node:20.0

commands:
  restore-npm:
    steps:
      - restore_cache:
          keys:
            - npm-v1-{{ checksum "package-lock.json" }}
            - npm-v1-
      - run: npm ci --prefer-offline

jobs:
  prepare:
    executor: node
    steps:
      - checkout
      - restore_cache:
          keys:
            - npm-v1-{{ checksum "package-lock.json" }}
      - run: npm ci --prefer-offline
      - save_cache:
          key: npm-v1-{{ checksum "package-lock.json" }}
          paths: [~/.npm]

  lint:
    executor: node
    steps:
      - checkout
      - restore-npm
      - run: npm run lint
      - run: npm run typecheck

  test:
    executor: node
    parallelism: 4
    steps:
      - checkout
      - restore-npm
      - run:
          command: |
            circleci tests glob "src/**/*.test.ts" \
              | circleci tests split --split-by=timings \
              | xargs npx jest --testPathPattern
      - store_test_results:
          path: test-results

  build:
    executor: node
    steps:
      - checkout
      - restore-npm
      - run: npm run build
      - persist_to_workspace:
          root: .
          paths: [dist/]

  deploy-staging:
    executor: node
    steps:
      - attach_workspace:
          at: .
      - run: ./deploy.sh staging

  deploy-production:
    executor: node
    steps:
      - attach_workspace:
          at: .
      - run: ./deploy.sh production

workflows:
  pipeline:
    jobs:
      - prepare
      - lint:
          requires: [prepare]
      - test:
          requires: [prepare]
      - build:
          requires: [lint, test]
      - deploy-staging:
          requires: [build]
          filters:
            branches:
              only: main
            tags:
              ignore: /.*/
      - hold-production:
          type: approval
          requires: [build]
          filters:
            branches:
              ignore: /.*/
            tags:
              only: /^v\d+\.\d+\.\d+$/
      - deploy-production:
          requires: [hold-production]
          filters:
            branches:
              ignore: /.*/
            tags:
              only: /^v\d+\.\d+\.\d+$/
```

---

## Key Rules

- `save_cache` runs only in Prepare; `restore_cache` in all downstream jobs
- `persist_to_workspace` + `attach_workspace` for build artifacts (not caches)
- `requires:` on `build` must cover BOTH validate AND test job names
- `type: approval` creates a manual gate in the CircleCI UI
- Tag-based jobs require explicit `filters.tags.only` — CircleCI ignores tags by default
