# Type safety

> TypeScript rules: no any, named shapes only, import type, explicit returns, nullish idioms.
>
> Status: accepted · Version 1

## Type safety

- **No `any`**: model domain concepts with proper types and interfaces.
- **No inline types as generic parameters**: `createSomething<{ id: string }>()` and `fn<T extends { integrations?: UserIntegrations }>()` are forbidden. Define a named `interface` or `type` and reference it, including reusable shape constraints such as `WithUserIntegrations`.
- **`import type` for type-only imports**, so intent is clear and no runtime import is created.
- **Named exports only** — no default exports.
- **Explicit return types** on exported and standalone functions.
- **Prefer `unknown` over `any`** at boundaries; narrow before use.
- **Nullish idioms**: `??` for defaults; `== null` / `!= null` for combined null/undefined checks.
- **Optional fields** marked with `?`, not `| undefined`, in interfaces.
- **Interfaces for object shapes; `type` for unions and aliases.**
- **Fail fast with useful errors**: validate at boundaries, and messages must include IDs, values and what was expected.
- **Handle edge cases explicitly**: null / undefined, empty collections and boundary values are handled deliberately.
