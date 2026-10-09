# Structure and architecture

> Single responsibility, barrel-only index.ts, import and export rules, shared libraries, testability.
>
> Status: accepted · Version 1

## Structure and architecture

- **Single responsibility**: each file, function and hook does one thing. If describing it needs "and", split it. Prefer many small, focused files over few large ones.
- **Names are contracts**: don't add undeclared behaviour. Orchestration goes in a clearly named orchestrator, not inside a helper whose name implies something narrower.
- **`index.ts` is a barrel only**: no logic, functions, interfaces or classes. Primary exports live in a same-named file; `index.ts` re-exports them.
- **Import from the barrel, not deep files**: cross-module imports target another folder's `index.ts` (via an alias such as `@common/models`, or a relative path). Order imports third-party / vendored first, then aliased / local.
- **`try/catch` only at genuinely fallible boundaries** (DOM and cross-origin access, JSON parsing, filesystem); intentional empty `catch` blocks are commented to say why swallowing is correct.
- **Only export what is consumed externally**, at every level — file, folder, package. No "just in case" exports.
- **Shared libraries**: use `@anupheaus/common` helpers (`is`, `to`, collections, logging, `mapAsync`, `filterAsync`, `findAsync`) instead of re-implementing utilities or using `Promise.all(array.map(...))`. Reserve `Promise.all` for parallelising independent data sources.
- **Check `@anupheaus/react-ui` before writing any React code**: read `../react-ui/agent.md` and search the library before building a component, hook, provider, dialog, form field or UI primitive. Build bespoke only after confirming nothing fits.
- **Separate layers**: no DB or network calls in UI components — use hooks and providers.
- **Extract shared logic** only when it has a clear responsibility and more than one caller.
- **Design for testability**: core business logic lives in pure files that import only lightweight deps (types, `@anupheaus/common`, `luxon`), never the data layer (`@anupheaus/mxdb/*`) or an orchestrator.
- **Follow existing patterns and tooling** before introducing something new. If a preference is ambiguous, make a reasonable choice and note it in the commit or PR.
