# Types live in *-models.ts files

> Where domain and shared types are defined, plus With* shape constraints and the interface + namespace record pattern.
>
> Status: accepted · Version 1

## When to use

Whenever defining types, interfaces, enums, or a domain record.

## How to apply

- Types owned by one domain go in `<domain>/<name>-models.ts`; types shared across domains go in `models/<name>-models.ts`. One file per subject area.
- Never define types inline in hook, component or utility files.
- A reusable structural shape becomes a named `With*` interface in the owning models file, used on entities and in generic bounds — never inline.

```ts
export interface WithUserIntegrations {
  integrations?: UserIntegrations;
}
```

- Domain records use interface + namespace in the same models file: extend `Record` from `@anupheaus/common`, use `Math.uniqueId()` for new ids, and put `create`, helpers, constants and type unions in the namespace. `toListItems(records, enhance?)` takes an optional `enhance` delegate so call-sites add `onClick` or `subItems` in one pass.

## Avoid

A monolithic `types.ts` or `models.ts`, unrelated domains mixed in one file, inline object types in generic parameters, and factories or list helpers defined outside the namespace.
