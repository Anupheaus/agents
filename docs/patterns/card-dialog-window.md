# Card, Dialog and Window responsibilities

> Cards present, Dialogs own ephemeral record state, Windows take an id and fetch, persisting across reloads.
>
> Status: accepted · Version 1

## When to use

Any UI that edits or displays a domain record using `@anupheaus/react-ui`.

## How to apply

| Layer | Role | State | Opened with |
|---|---|---|---|
| Card | Presentational editing or view | None beyond UI-only state | N/A — used inside a Dialog or Window |
| Dialog | Modal editor | `useUpdatableState` or local state | Optional record object, not persisted |
| Window | Persistent editor | Fetched with a data hook | Primitive `id` only |

- Cards receive the record and `onChange(record)`; they never save, delete or fetch.
- Dialogs use `createDialog`, wrap a Card, and return the saved record, `'delete'` or `undefined` from `close()`.
- Windows use `createWindow`, fetch with a hook such as `useEntity(id, true)`, save through the hook, then `close()`.

## Avoid

Cards that fetch data or call upsert/remove; dialogs and windows that embed form layout instead of extracting a Card; windows that take a full record object as a parameter.
