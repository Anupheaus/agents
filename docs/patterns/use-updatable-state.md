# Keep local state in sync with useUpdatableState

> useUpdatableState resolves provided, previous then default state and reacts to a prop changing while mounted.
>
> Status: accepted · Version 1

## When to use

Local state that must stay in sync when a prop or external source changes — especially dialogs and components that receive a provided record.

## How to apply

```ts
const [entity, setEntity] = useUpdatableState<Entity>(
  prevEntity => providedEntity ?? prevEntity ?? Entity.create(),
  [providedEntity],
);
```

- First argument: an initializer receiving previous state, resolving provided, then previous, then default.
- Second argument: the dependency array, usually the prop that drives updates.
- In windows, prefer hook-fetched data — the hook already returns fresh database state.

## Avoid

Plain `useState(providedEntity)` when the provided value can change, and `useUpdatableState` in a window instead of a data hook.
