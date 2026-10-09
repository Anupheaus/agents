# Patterns

Patterns every repo follows: client/common/server boundaries, domain organisation and hooks, models files, providers, typed errors.

## Docs

- [Client / common / server boundaries](client-common-server-boundaries.md): Where code belongs across client, common and server folders, and why common must depend on neither.
- [Expose domain logic through useXxx hooks](domain-hooks.md): Each domain owns a hook in its own folder that returns named operations; consumers hold no domain logic.
- [Organise code by domain, in focused files](domain-organisation.md): Extract standalone logic into small single-purpose files and group files by domain, not by technical type.
- [Types live in *-models.ts files](models-files.md): Where domain and shared types are defined, plus With* shape constraints and the interface + namespace record pattern.
- [Abstract third-party providers behind one domain API](provider-abstraction.md): One provider-agnostic domain function routes to per-vendor adapter files, so adding a provider changes no call-sites.
