# Validation and loading states

> Use useValidation with ValidateSection for input errors, and UIState with isLoading before rendering data-dependent children.
>
> Status: accepted · Version 1

## When to use

Forms and editors that need user-input validation or asynchronous data.

## How to apply

- Validation: `const { validate } = useValidation()`, wrap sections in `ValidateSection`, and have validate functions return error messages.
- Loading: wrap data-dependent UI in `UIState` with `isLoading`, combining several flags with `||`.

```tsx
const isLoading = isLoadingQuotes || isLoadingCustomers;
<UIState isLoading={isLoading}>{/* ... */}</UIState>
```

## Avoid

Ad-hoc error string state where `useValidation` and `ValidateSection` fit, and rendering children before the data is ready.
