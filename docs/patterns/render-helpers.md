# Lift JSX-returning helpers into components

> A function that returns JSX is a component: define it at module level or in a sibling file, never inside another component.
>
> Status: accepted · Version 1

## When to use

Any component where you are tempted to define a helper function that returns JSX.

## How to apply

- Lift it into its own named component, in the same file or a sibling, and pass its data in through props.
- Pure helpers that do not return JSX, such as `formatDimensions`, stay plain module-level functions.

Why: defined inside a component and rendered as `<Foo />`, React treats the function as a new type on every parent render and remounts it, resetting state, focus, selection, scroll and effects.

```tsx
interface SalesCardLineItemBodyProps { item: SalesCardLineItem; isStaff: boolean; }

function SalesCardLineItemBody({ item, isStaff }: SalesCardLineItemBodyProps) { /* JSX */ }

function SalesCard({ items, isStaff }: SalesCardProps) {
  return <>{items.map(item => <SalesCardLineItemBody key={item.id} item={item} isStaff={isStaff} />)}</>;
}
```

## Avoid

A JSX-returning function defined inside a component and rendered as `<Foo />`.
