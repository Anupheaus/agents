# Code Patterns

This document captures recurring implementation patterns across repos. Read this before writing or modifying any code.

---

## Client / Common / Server boundary separation

**When to use:** Any repo with `src/client/`, `src/common/`, and `src/server/` subdirectories.

**How to apply:**
- Client-only code → `client/`, server-only → `server/`, anything usable by both → `common/` (models, shared types, validation schemas, pure utilities, constants).
- `common/` must **never** import from `client/` or `server/` — no cross-boundary dependencies.
- When placing a new file, ask: "Could this ever be needed on the other target?" Yes → `common/`. Runtime-specific → appropriate target folder.

**Avoid:** Importing server modules from client (or vice versa) via `common/` as a pass-through. Putting shared types inside a client or server file just because they were first needed there.

---

## Break code into focused files; place by domain

**When to use:** Whenever a file grows beyond a single responsibility, or logic could naturally live elsewhere.

**How to apply:**
- Before adding code, ask: "Does this belong here, or in another domain?"
- If logic can stand alone, extract it. If it could be reused now or plausibly in future, place it at the appropriate domain level rather than nested inside the consuming feature.
- Group files by domain, not by type — prefer `payments/utils.ts` over `utils/paymentHelpers.ts`.

**Avoid:** Large files mixing concerns from multiple domains. Utility functions buried inside page or component files.

---

## Domain hooks — expose domain logic via `useDomain()` hooks

**When to use:** Whenever a page, component, or other domain needs to perform an action that belongs to a different domain.

**How to apply:**
- Create a hook in the owning domain folder (e.g. `payments/usePayments.ts`) that encapsulates all logic for that domain.
- Return named utilities so callers get a clean, self-documenting API.
- Consuming files call the hook and destructure only what they need — implementation never lives in the consumer.

```ts
// payments/usePayments.ts
export function usePayments() {
  const createPaymentLink = async (quoteId: string) => { /* ... */ };
  return { createPaymentLink };
}

// quotes/QuotePage.tsx
const { createPaymentLink } = usePayments();
```

**Avoid:** Embedding domain logic (API calls, business rules, transformations) in page or component files. Creating a hook in the consuming domain instead of the owning one. Putting behavioural helpers on model namespaces (`UserIntegration.applyGoogleCalendarSettings`) — expose them from the domain's `useXxx` hook instead; models keep types, constants, and record-oriented factories/filters only.

---

## Abstract vendor/provider implementations behind a generic interface

**When to use:** Whenever a domain supports multiple third-party providers for the same capability (payment gateways, SMS, storage, email, etc.).

**How to apply:**
- Expose one provider-agnostic function from the domain hook — the caller never names a vendor in the function name.
- Accept a `provider` discriminator in the options object — a string union of known IDs or a `providerId: string` resolved at runtime from DB/config.
- Inside the domain, a provider registry/switch routes to the correct vendor adapter; each adapter lives in its own file within the domain folder.
- All vendor-specific details (API keys, SDK calls, response mapping) stay inside the adapter. Adding a new provider = new adapter file + registration; no call-sites change.

```ts
// payments/usePayments.ts
export function usePayments() {
  const generatePaymentUrl = async (options: {
    provider: 'revolut' | 'elavon'; // or providerId: string for DB-driven
    amount: number;
    currency: string;
  }): Promise<string> => {
    const adapter = getPaymentAdapter(options.provider);
    return adapter.generatePaymentUrl(options);
  };
  return { generatePaymentUrl };
}

// call-site — no vendor knowledge required
const { generatePaymentUrl } = usePayments();
const url = await generatePaymentUrl({ provider: 'revolut', amount: 100, currency: 'EUR' });
```

**Avoid:** Vendor names in function names (`generateRevolutPaymentUrl`). Provider-specific SDK types or error shapes leaking out of the adapter. Duplicating provider-selection logic across call-sites.

---

## Types and interfaces in `*-models.ts` files

**When to use:** Whenever defining types, interfaces, or enums.

**How to apply:**
- Types owned by one domain → `<domain>/<name>-models.ts` (e.g. `payments/payment-models.ts`).
- Types used across multiple domains or with ambiguous ownership → `models/<name>-models.ts` (e.g. `models/payment-models.ts`, `models/order-models.ts`).
- One file per subject area; group related types together within it.
- Never define types inline in hook, component, or utility files — always extract to the appropriate models file.

**Avoid:** Single monolithic `types.ts` or `models.ts` regardless of subject. Mixing unrelated domain types in one file. Types defined at the top of the file that uses them when they could be needed elsewhere. Inline object types in generic constraints — extract shape constraints to named types in the owning `*-models.ts` file (e.g. `WithUserIntegrations` for `{ integrations?: UserIntegrations }`).

### Named shape constraints (`With*` types)

**When to use:** A function or generic needs to constrain a parameter to a structural shape (optional nested field, mixin, etc.) and that shape is reused or appears in a generic bound.

**How to apply:**
- Define a named `interface` in the domain's `*-models.ts` file, typically prefixed `With` + field concept.
- Use it on entity interfaces (`User extends MXDBUser, WithUserIntegrations`) and in generic bounds (`T extends WithUserIntegrations`).

```ts
export interface WithUserIntegrations {
  integrations?: UserIntegrations;
}

export function applyGoogleCalendarSettings<T extends WithUserIntegrations>(
  user: T,
  settings: GoogleCalendarSettingsInput,
): T { /* ... */ }
```

**Avoid:** Inline `{ integrations?: UserIntegrations }` (or similar) in `extends` clauses, function parameters, or generic parameters.

### Interface + namespace pattern

Domain records use **interface + namespace** in the same `*-models.ts` file:

```ts
export interface Entity extends Record {
  name: string;
}

export namespace Entity {
  export const create = (): Entity => ({
    id: Math.uniqueId(),
    name: '',
  });

  export const toListItems = (
    records: Entity[],
    enhance?: (record: Entity) => Partial<ReactListItem<Entity>>,
  ): ReactListItem<Entity>[] =>
    records
      .map(record => ({ id: record.id, text: record.name, data: record, ...enhance?.(record) }))
      .orderBy('text');
}
```

- Extend `Record` from `@anupheaus/common` (includes `id: string`).
- Put `create()`, helpers, constants, and type unions in the namespace — not on the interface.
- Use `Math.uniqueId()` for new IDs.
- `toListItems` accepts an optional `enhance` delegate so consumers can add `onClick`, `subItems`, etc. in one pass.

**Avoid:** Factory functions or list helpers defined outside the namespace. Spreading list-item enrichment in a separate `.map()` at every call-site.

---

## Use typed error classes from `@anupheaus/common`

**When to use:** Whenever throwing an error anywhere in the codebase.

**How to apply:**
- Always use the most semantically accurate class from `@anupheaus/common` (e.g. `APIError`, `AuthenticationError`) over the plain `Error` constructor.
- Typed errors enable precise `instanceof` guards at catch boundaries and give structured access to error details instead of parsing a message string.
- If no existing class fits and a typed error would genuinely be useful, **suggest a new error class to the user** rather than falling back to `Error`.

```ts
// avoid
throw new Error('User is not authenticated');

// prefer
throw new AuthenticationError({ message: 'User is not authenticated' });

// precise guard at catch boundary
if (err instanceof AuthenticationError) { /* redirect to login */ }
if (err instanceof APIError) { /* show API failure UI */ }
```

**Avoid:** `throw new Error('...')` except as a last resort. Catching `Error` broadly when a specific class is intended. Encoding error context in a message string instead of structured fields on a typed error class.

---

## Use `useFields` for form/record editing in tab and card components

**When to use:** Whenever a component receives a record object as a prop and needs to let the user edit one or more of its fields. Replaces a list of `useBound` callbacks that each spread the parent object.

**How to apply:**
- Call `useFields(record, onChange)` at the top of the component.
- Use the returned `Field` component to wire inputs declaratively — no manual `value`/`onChange` props needed.
- Use `useField('fieldName')` when you need the current value for conditional rendering or complex update logic. It returns `{ fieldName, setFieldName }`.
- For numeric fields use `Number` (from `@anupheaus/react-ui`) as the `Field` component — it accepts `value: number` directly.
- `useFields` is exported from `@anupheaus/react-ui`.

```tsx
// ❌ Old pattern — one useBound per field
const setTravelMode = useBound((mode: string) =>
  onChange({ ...appointments, travelTimeMode: mode as TravelTimeModeValue }));
const setBuffer = useBound((val: string) =>
  onChange({ ...appointments, fixedBufferMinutes: parseInt(val, 10) || 0 }));

// ✅ New pattern — declarative wiring via useFields
const { Field, useField } = useFields(appointments, onChange);
const { travelTimeMode } = useField('travelTimeMode'); // needed for conditional render only

<Field component={Radio} field="travelTimeMode" label="..." values={modes} />
{travelTimeMode === 'fixed' && (
  <Field component={Number} field="fixedBufferMinutes" label="Buffer (minutes)" />
)}
```

**For complex field updates** (e.g. toggling items in a nested record), use `useField` to get a typed setter for that sub-field rather than spreading the entire parent:

```tsx
const { useField } = useFields(schedule, onChange);
const { workingHours, setWorkingHours } = useField('workingHours');

// Now update just the sub-field without touching the parent:
setWorkingHours({ ...workingHours, [key]: newDay });
```

**Avoid:** Writing `useBound((value) => onChange({ ...record, fieldName: value }))` for each field. Mixing `Field` and manual `useBound` callbacks for the same record — pick one style per component.

---

## Card / Dialog / Window — separation of concerns

**When to use:** Any UI that edits or displays a domain record using `@anupheaus/react-ui`.

**How to apply:**

| Layer | Role | State | Opens with |
|-------|------|-------|------------|
| **Card** | Presentational editing/view UI | None (except UI-only, e.g. expand/collapse) | N/A — used inside Dialog/Window |
| **Dialog** | Modal editor; owns record state | `useUpdatableState` or local state | Optional record object (not persisted) |
| **Window** | Persistent editor opened by ID | Fetched via data hook | Primitive `id` only — see next section |

**Cards:**
- Receive the record and `onChange(record)`.
- Call `onChange` when data changes; no save/delete orchestration.
- Use `createComponent`, `useBound` for handlers, `useFields` or `useMemo` as appropriate.

**Dialogs:**
- Use `createDialog`; manage state; wrap a Card.
- Return the saved record, `'delete'`, or `undefined` via `close()`.
- May accept an optional record object as an opener argument — dialogs are not persisted across reloads.

**Windows:**
- Use `createWindow`; fetch the record with a hook (e.g. `useEntity(id, true)`).
- Save/delete via hook upsert/remove, then `close()`.
- Persistent — parameters survive reload; see **Window parameters** below.

**Avoid:** Cards that fetch data or call upsert/remove. Dialogs/windows that embed form layout without extracting a Card. Windows that accept full record objects as parameters.

---

## Window parameters — primitives only (critical)

**When to use:** Whenever defining or calling a `createWindow` window.

**How to apply:**
- Window parameters are **persisted and deserialised** when the window reloads.
- Pass **only primitive values** — typically `id: string`. Never pass objects or arrays.
- Always fetch the latest record inside the window with a data hook: `const { entity, setEntity, upsertEntity } = useEntity(id, true)`.
- Objects passed as parameters become **stale** and will not reflect current database state after reload.

```ts
// ✅ Correct
export const EntityWindow = createWindow('EntityWindow', ({ id }: { id: string }) => () => {
  const { entity, setEntity, upsertEntity } = useEntity(id, true);
  // ...
});

// ❌ Wrong — object param goes stale on reload
export const EntityWindow = createWindow('EntityWindow', ({ entity }: { entity: Entity }) => () => {
  // entity may be outdated
});
```

**Dialogs vs windows:** Dialogs may accept objects as opener arguments because they are ephemeral. Windows must use `id` + hook.

**Avoid:** `{ entity }`, `{ order }`, or any object/array as a window parameter. Caching record state only from the opener argument instead of the hook.

---

## `useUpdatableState` — sync with external updates

**When to use:** Local state that must stay in sync when a prop or external source changes — especially in dialogs and components that receive a provided record.

**How to apply:**

```ts
const [entity, setEntity] = useUpdatableState<Entity>(
  prevEntity => providedEntity ?? prevEntity ?? Entity.create(),
  [providedEntity],
);
```

- First argument: initializer receiving previous state; resolve **provided → previous → default**.
- Second argument: dependency array (usually the prop that drives updates).
- Use in dialogs and any component where the source record can change while mounted.

**Windows:** Prefer hook-fetched data over `useUpdatableState` — the hook already returns fresh DB state.

**Avoid:** Plain `useState(providedEntity)` when `providedEntity` can change. Using `useUpdatableState` in windows instead of a data hook.

---

## Selector components

**When to use:** A dropdown or list control that picks one record from a collection.

**How to apply:**
- Props: `value` (record or id) and `onChange`.
- Fetch options via a collection hook or `useCollection`.
- Convert records with `Entity.toListItems(...)` inside `useMemo`.
- Wrap in `UIState` with `isLoading`; render `DropDown` (or `List`) with memoised `values`.

```tsx
export const EntitySelector = createComponent('EntitySelector', ({
  value: entity,
  onChange,
  ...props
}: Props) => {
  const { records, isLoading } = useEntitiesQuery();
  const entityId = is.plainObject(entity) ? entity.id : entity;
  const values = useMemo(() => Entity.toListItems(records), [records]);

  return (
    <UIState isLoading={isLoading}>
      <DropDown value={entityId} values={values} onChange={onChange} {...props} />
    </UIState>
  );
});
```

**Avoid:** Inline `.map()` to build list items in JSX. Fetching inside the parent instead of the selector when the selector owns the choice.

---

## Validation and loading states

**When to use:** Forms and editors that need user-input validation or async data.

**Validation:**
- Use `useValidation()` → `{ validate }`.
- Wrap sections in `ValidateSection`; return error messages from validate functions.

**Loading:**
- Use `UIState` with `isLoading`.
- Combine multiple flags: `const isLoading = isLoadingA || isLoadingB`.

**Avoid:** Ad-hoc error string state when `useValidation`/`ValidateSection` fit. Rendering children before data is ready without `UIState`.

---

## Extract render helpers into their own components — never nest a JSX-returning function

**When to use:** Any React component where you're tempted to define a helper function that returns JSX.

**How to apply:**
- Lift the render helper into its own named component (same file, or a sibling) and pass its data in via props.
- Pure, non-JSX helpers (`formatDimensions`, `getFulfilmentLabel`) stay as plain module-level functions — this rule is specifically about functions that return JSX.

**Why:**
- Each nested render function is re-created on every parent render and can't be memoised or tested in isolation.
- **If a nested function is rendered as an element (`<Foo />`), React treats it as a new component type on every parent render and remounts it** — discarding its state, focus, text selection, and scroll position, and re-running its effects. This is the sharpest frontend failure mode: subtle, intermittent, and easy to misdiagnose.
- A function returning JSX is a component in disguise — making it a real component gives it a name in the tree, its own render boundary, and a clear props contract.

```tsx
// ❌ Avoid — helper function inside the component
function SalesCard({ items, isStaff }: SalesCardProps) {
  function renderItemBody(item: SalesCardLineItem) {
    const description = [item.productName, item.rangeLabel].filter(Boolean).join(' · ');
    // ...
    return (/* JSX */);
  }
  return <>{items.map(renderItemBody)}</>;
}

// ✅ Prefer — a real component with a props contract
interface SalesCardLineItemBodyProps { item: SalesCardLineItem; isStaff: boolean; }

function SalesCardLineItemBody({ item, isStaff }: SalesCardLineItemBodyProps) {
  const description = [item.productName, item.rangeLabel].filter(Boolean).join(' · ');
  // ...
  return (/* JSX */);
}

function SalesCard({ items, isStaff }: SalesCardProps) {
  return <>{items.map(item => <SalesCardLineItemBody key={item.id} item={item} isStaff={isStaff} />)}</>;
}
```

**Avoid:** Defining a JSX-returning function inside a component and rendering it as `<Foo />` — it remounts on every parent render.
