# Expose domain logic through useXxx hooks

> Each domain owns a hook in its own folder that returns named operations; consumers hold no domain logic.
>
> Status: accepted · Version 1

## When to use

Whenever a page, component or other domain needs to perform an action that belongs to a different domain.

## How to apply

- Create the hook in the owning domain folder, e.g. `payments/usePayments.ts`, encapsulating all logic for that domain.
- Return named operations so callers get a clean, self-documenting API.
- Consumers call the hook and destructure only what they need; the implementation never moves into the consumer.

```ts
// payments/usePayments.ts
export function usePayments() {
  const createPaymentLink = async (quoteId: string) => { /* ... */ };
  return { createPaymentLink };
}

// quotes/QuotePage.tsx
const { createPaymentLink } = usePayments();
```

## Avoid

Embedding API calls, business rules or transformations in page and component files; creating the hook in the consuming domain; putting behavioural helpers on model namespaces — models keep types, constants and record-oriented factories and filters only.
