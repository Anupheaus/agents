# Code style and formatting

> Personal style rules for all repos: functional/hook-driven code, formatting, naming and readability.
>
> Status: accepted · Version 1

## Functional and hook-driven style

- **Functions, not classes**: no `this`, inheritance or stateful objects. Prefer pure functions and composition.
- **Hook-style everywhere** (`useXxx`): the preferred way to encapsulate a domain's utilities, server code included. A hook returns a named object of operations and stays scoped to one domain.
- **No utility bags**: no `utils.ts` or `helpers.ts`. Group utilities into focused hooks or modules with a clear owner.

## Formatting

- 2-space indentation, single quotes, semicolons.
- Trailing commas in multi-line object, array and import literals.
- Numeric separators for large numbers (`60_000`).
- Blank line at the end of every file.
- Compact single-line object literals for small config shapes; break to multi-line as the shape grows.

## Style and readability

- **Destructure eagerly** at the point of use — never repeated dot notation such as `props.isVisible`.
- Name locals to match the target prop where feasible; rename only when it adds clarity.
- Clarity over cleverness: comment any non-obvious one-liner.
- `camelCase` for variables and functions, `PascalCase` for components and types, `use` prefix for hooks.
- kebab-case for domain / action / util filenames; `PascalCase` for component and model-contract files; tests co-located as `*.tests.ts`.
- Explicit suffixes for payload shapes (`...Payload`, `...Result`, `...Request`, `...Response`, `...Details`); `UPPER_SNAKE_CASE` module constants; lowercase-hyphen string unions (`'top-left'`); `is` / `has` prefixes on booleans.
- Comment banners (`// ─── Section ───`) separate logical blocks in larger files.
- Descriptive loop variables — never `i`, `j` or `item`; name after what the value represents.
- No magic values. Comments explain *why*, not what. JSDoc on exported interfaces, fields and non-obvious constants.
- Max 2 function parameters; 3+ means a single object parameter.
- Early returns over nesting; `const` by default, `let` only when reassignment is needed.
