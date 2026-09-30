## Personal coding standards

### Functional and hook-driven style

- **Functions, not classes**: No `this`, inheritance, or stateful objects. Prefer pure functions and composition.
- **Hook-style everywhere** (`useXxx`): The preferred way to encapsulate related utilities for a domain — including server code. Hooks return a named object of operations, stay scoped to one domain, and compose into complex flows rather than growing monolithic.
- **No utility bags**: No `utils.ts` or `helpers.ts`. Group utilities into focused hooks or modules with a clear owner.

### Formatting

- **Indentation:** 2 spaces.
- **Quotes:** single quotes for strings.
- **Semicolons:** always terminate statements.
- **Trailing commas:** in multi-line object / array / import literals.
- **Numeric separators** for large numbers (e.g. `60_000`).
- **Blank line at end of file.**
- Prefer compact single-line object literals for small config shapes; break to multi-line as the shape grows.

### Style and readability

- **Destructure eagerly**: Always destructure properties from function parameters and return values at the point of use. Never access properties via repeated dot notation (e.g. `props.isVisible`) — destructure instead (`const { isVisible } = props`, or inline in the parameter list).
- **Match variable names to prop names where feasible**: When passing a value into a function or component, name the local variable to match the target prop so no aliasing is needed. A more specific name in the caller is fine when it adds clarity (e.g. `isSaveButtonVisible` passed as `isVisible`), but avoid gratuitous renaming — if the names can naturally align, they should.
- **Clarity over cleverness**: Comment any non-obvious one-liner or compact expression.
- **Descriptive naming**: `camelCase` for variables/functions, `PascalCase` for components/classes, `use` prefix for hooks.
- **Naming specifics**: kebab-case for domain / action / util module filenames; `PascalCase` for React component and model-contract files; tests co-located with a `*.tests.ts` suffix. Interfaces & types are `PascalCase`, with explicit suffixes for payload/response shapes (`...Payload`, `...Result`, `...Request`, `...Response`, `...Details`). Module-level constants are `UPPER_SNAKE_CASE`. Union string-literal members are lowercase-hyphen (e.g. `'top-left' | 'top-right'`). Booleans / status fields are prefixed `is` / `has`.
- **Comment banners** (`// ─── Section ───`) separate logical blocks within larger files.
- **Loop variables must be descriptive**: Never use single-letter names (`i`, `j`, `w`, `x`) or generic placeholders (`item`) in `.map`, `.forEach`, or `for` loops. Name after what the value represents (e.g. `roomWindow`, `orderItem`, `quoteLine`).
- **No magic values**: Extract literals into well-named constants.
- **Comments explain *why***, not what.
- **JSDoc (`/** … */`) on exported interfaces, fields, and non-obvious constants** — describe intent and units, don't restate the code.
- **Max 2 function parameters**: When 3+ are needed, use a single object parameter with properties for each argument.
- **Early returns over nesting**: Guard clauses keep the happy path flat. Avoid deep `if/else` chains.
- **`const` by default**: Use `let` only when reassignment is genuinely needed.

### Type safety

- **No `any`**: Model domain concepts with proper types and interfaces.
- **No inline types as generic parameters**: `createSomething<{ id: string }>()` and `fn<T extends { integrations?: UserIntegrations }>()` are forbidden. Always define a named `interface` or `type` and reference it — including reusable shape constraints (e.g. `WithUserIntegrations` instead of `{ integrations?: UserIntegrations }`).
- **`import type` for type-only imports**: Signals intent and avoids accidental runtime imports.
- **Named exports only**: No default exports.
- **Fail fast with useful errors**: Validate at boundaries; error messages must include IDs, values, and what was expected.
- **Handle edge cases explicitly**: null/undefined, empty collections, and boundary values must be handled deliberately.
- **Explicit return types** on exported / standalone functions.
- **Prefer `unknown` over `any`** at boundaries; narrow before use.
- **Nullish idioms**: `??` for defaults; `== null` / `!= null` for combined null/undefined checks.
- **Optional fields** marked with `?`, not `| undefined`, in interfaces.
- **Interfaces for object shapes; `type` for unions and aliases.**

### Structure and architecture

- **Single responsibility**: Each file, function, and hook does one thing. If describing it requires "and", split it.
  - **Names are contracts**: Don't add undeclared behaviour. Orchestration goes in a clearly-named orchestrator, not inside a helper whose name implies something narrower.
  - **One responsibility per file**: Prefer many small, focused files over few large ones.
- **`index.ts` is a barrel only**: No logic, functions, interfaces, or classes. Primary exports live in a same-named file; `index.ts` re-exports them.
- **Import from the barrel, not deep files**: cross-module imports target another folder's `index.ts` (via an alias such as `@common/models`, or a relative path), never a deep file inside it. Use path aliases for cross-cutting shared code, relative imports within a feature, and order imports third-party / vendored first, then aliased / local.
- **`try/catch` only at genuinely fallible boundaries** (DOM / cross-origin access, JSON parsing, filesystem); intentional empty `catch` blocks are commented to state why swallowing is correct.
- **Only export what is actually consumed externally**: At every level — file, folder, package. No "just in case" exports. If nothing imports it, it stays unexported.
- **Shared libraries**:
  - Use `@anupheaus/common` helpers (`is`, `to`, collections, logging, `mapAsync`, `filterAsync`, `findAsync`, etc.) over re-implementing utilities or using `Promise.all(array.map(...))`. Reserve `Promise.all` for parallelising independent data sources, not mapping a single collection.
  - **REQUIRED — check `@anupheaus/react-ui` before writing any React code**: Read `../react-ui/agent.md` and search the library before building any component, hook, provider, dialog, form field, or UI primitive. Only build bespoke after confirming nothing fits.
- **Separate layers**: No DB or network calls in UI components — use hooks/providers.
- **Extract shared logic** only when it has a clear responsibility and is used in more than one place.
- **Design for testability**: Pure functions for core business logic. Keep that logic in a file that imports only lightweight deps (types, `@anupheaus/common`, `luxon`) — not the data layer (`@anupheaus/mxdb/*`) or an orchestrator that does. The split stays even where the test runner can load ESM: the pure file is what the unit test imports.

### Git and project hygiene

- **Small, focused commits**: Scope commits and PRs to a single responsibility.
- **Commit messages explain *why***: Not just what changed — what motivated it.
- **No commented-out code**: Delete dead code. Git history is the record.
- **Tidy configuration**: Keep linters/formatters current; no unused config or scripts.

### React-specific preferences

- **One component per file**: Extract sub-components into sibling files.
- **No inline functions in JSX**: Use `useBound` for event/callback handlers; `useCallback` only when memoisation semantics are specifically required.
- **No inline styles or objects**: Never `style={{ ... }}`. Define styles as constants or in `createStyles`. No inline object/array literals as props — use `useMemo`.
- **No inline `.map()` in JSX**: Compute rendered items via `useMemo` and reference the result.
- **Extract data logic into hooks**: Component handles layout; a local `use*` hook handles derived data.
- **Extract self-contained UI**: If a chunk has its own state, logic, or styling, it becomes a standalone component file.
- **`useOnMount` ignores any returned cleanup** (`@anupheaus/react-ui`): it runs the delegate inside a `useEffect` without propagating a teardown, so returning a cleanup function leaks it. For listeners/subscriptions that must be removed, store the handle in a `useRef` and remove it in `useOnUnmount` (see `NetworkStatusProvider`). Use `useOnChange` to react to dependency changes after mount.

### Notes for AI agents

- Follow existing patterns, tooling, and naming before introducing something new. Check `@anupheaus/common` and `@anupheaus/react-ui` first (the react-ui check above is required, not optional).
- If a preference is ambiguous, make a reasonable choice and note it in the commit message or PR.
