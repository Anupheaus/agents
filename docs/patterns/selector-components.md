# Selector components own their collection

> A selector takes value and onChange, fetches its own options, and builds list items with useMemo and toListItems.
>
> Status: accepted · Version 1

## When to use

A dropdown or list control that picks one record from a collection.

## How to apply

- Props are `value` (record or id) and `onChange`.
- Fetch options with a collection hook, convert records with `Entity.toListItems(...)` inside `useMemo`, and accept either a record or an id in `value`.
- Wrap the control in `UIState` with `isLoading` and render `DropDown` (or `List`) with the memoised `values`.

```tsx
const { records, isLoading } = useEntitiesQuery();
const entityId = is.plainObject(entity) ? entity.id : entity;
const values = useMemo(() => Entity.toListItems(records), [records]);
```

## Avoid

Inline `.map()` in JSX to build list items, and fetching options in the parent when the selector owns the choice.
