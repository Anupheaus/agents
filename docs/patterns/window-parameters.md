# Window parameters must be primitives

> Window parameters are persisted and deserialised, so pass only primitives and fetch the record by id inside the window.
>
> Status: accepted · Version 1

## When to use

Whenever defining or calling a `createWindow` window.

## How to apply

- Window parameters are persisted and deserialised when the window reloads, so pass only primitive values — typically `id: string`.
- Fetch the freshest record inside the window with a data hook: `const { entity, setEntity, upsertEntity } = useEntity(id, true)`.
- Objects and arrays passed as parameters go stale and no longer reflect database state after a reload. Dialogs may take objects because they are ephemeral; windows may not.

```ts
export const EntityWindow = createWindow('EntityWindow', ({ id }: { id: string }) => () => {
  const { entity, setEntity, upsertEntity } = useEntity(id, true);
});
```

## Avoid

`{ entity }`, `{ order }` or any object or array as a window parameter, and caching record state from the opener argument instead of from the hook.
