# Organise code by domain, in focused files

> Extract standalone logic into small single-purpose files and group files by domain, not by technical type.
>
> Status: accepted · Version 1

## When to use

Whenever a file grows beyond a single responsibility, or logic could naturally live somewhere else.

## How to apply

- Before adding code, ask whether it belongs here or in another domain, and whether it can stand alone.
- Extract logic that stands alone. If it could be reused now or plausibly later, place it at the domain level rather than nested inside the consumer.
- Group by domain, not by technical type: prefer `payments/utils.ts` over `utils/paymentHelpers.ts`.

## Avoid

Large files mixing concerns from several domains, and utility functions buried inside page or component files.
