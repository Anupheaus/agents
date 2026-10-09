# Use useFields for record editing

> Wire record fields declaratively with useFields and its Field component instead of one useBound callback per field.
>
> Status: accepted · Version 1

## When to use

Whenever a component receives a record as a prop and lets the user edit one or more of its fields — tab and card components especially. Replaces a list of `useBound` callbacks that each spread the parent object.

## How to apply

- Call `useFields(record, onChange)` at the top of the component (`@anupheaus/react-ui`).
- Wire inputs with the returned `Field` component — no manual `value`/`onChange` props.
- Use `useField('fieldName')` when you need the value for conditional rendering or a typed sub-field setter; it returns `{ fieldName, setFieldName }`.
- For numeric fields pass `Number` from `@anupheaus/react-ui` as the `Field` component; it accepts `value: number`.

```tsx
const { Field, useField } = useFields(appointments, onChange);
const { travelTimeMode } = useField('travelTimeMode');

<Field component={Radio} field="travelTimeMode" label="Travel mode" values={modes} />
{travelTimeMode === 'fixed' && (
  <Field component={Number} field="fixedBufferMinutes" label="Buffer (minutes)" />
)}
```

## Avoid

`useBound((value) => onChange({ ...record, fieldName: value }))` for each field, and mixing `Field` with manual `useBound` callbacks for the same record — pick one style per component.
