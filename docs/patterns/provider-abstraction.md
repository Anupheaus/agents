# Abstract third-party providers behind one domain API

> One provider-agnostic domain function routes to per-vendor adapter files, so adding a provider changes no call-sites.
>
> Status: accepted · Version 1

## When to use

Whenever a domain supports several third-party providers for the same capability — payment gateways, SMS, storage, email.

## How to apply

- Expose one provider-agnostic function from the domain hook; the caller never names a vendor.
- Take a `provider` discriminator in the options: a string union of known ids, or a `providerId` resolved from DB or config at runtime.
- Route inside the domain through a provider registry or switch to one adapter file per vendor, all in the domain folder.
- Keep API keys, SDK calls and response mapping inside the adapter. A new provider is a new adapter file plus registration.

```ts
const { generatePaymentUrl } = usePayments();
const url = await generatePaymentUrl({ provider: 'revolut', amount: 100, currency: 'EUR' });
```

## Avoid

Vendor names in function names (`generateRevolutPaymentUrl`), provider SDK types or error shapes leaking out of the adapter, and provider-selection logic duplicated at call-sites.
