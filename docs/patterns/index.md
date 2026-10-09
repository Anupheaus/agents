# Patterns

Recurring implementation patterns shared across the personal repos — read the relevant ones before writing code.

## Docs

- [Card, Dialog and Window responsibilities](card-dialog-window.md): Cards present, Dialogs own ephemeral record state, Windows take an id and fetch, persisting across reloads.
- [Client / common / server boundaries](client-common-server-boundaries.md): Where code belongs across client, common and server folders, and why common must depend on neither.
- [Expose domain logic through useXxx hooks](domain-hooks.md): Each domain owns a hook in its own folder that returns named operations; consumers hold no domain logic.
- [Organise code by domain, in focused files](domain-organisation.md): Extract standalone logic into small single-purpose files and group files by domain, not by technical type.
- [Types live in *-models.ts files](models-files.md): Where domain and shared types are defined, plus With* shape constraints and the interface + namespace record pattern.
- [Abstract third-party providers behind one domain API](provider-abstraction.md): One provider-agnostic domain function routes to per-vendor adapter files, so adding a provider changes no call-sites.
- [Lift JSX-returning helpers into components](render-helpers.md): A function that returns JSX is a component: define it at module level or in a sibling file, never inside another component.
- [Selector components own their collection](selector-components.md): A selector takes value and onChange, fetches its own options, and builds list items with useMemo and toListItems.
- [Throw typed errors from @anupheaus/common](typed-errors.md): Use the most semantically accurate typed error class instead of Error, so catch boundaries can guard precisely.
- [Use useFields for record editing](use-fields.md): Wire record fields declaratively with useFields and its Field component instead of one useBound callback per field.
- [Keep local state in sync with useUpdatableState](use-updatable-state.md): useUpdatableState resolves provided, previous then default state and reacts to a prop changing while mounted.
- [Validation and loading states](validation-and-loading.md): Use useValidation with ValidateSection for input errors, and UIState with isLoading before rendering data-dependent children.
- [Window parameters must be primitives](window-parameters.md): Window parameters are persisted and deserialised, so pass only primitives and fetch the record by id inside the window.
