---
name: utils-placement
description: What belongs in src/utils, and whether a helper goes under features/<domain> or shared/<capability>
applies_to: src/utils/**
---

# Pure helpers

`src/utils` holds **pure helpers only** — plain functions, constants, and the types they need.
No React, no JSX, no hooks, no fetching, no module-level state.

```
src/utils/
  features/<domain>/     domain-aware helpers, one directory per domain object
  shared/<capability>/   domain-agnostic helpers, one directory per capability
```

Both roots are flat inside: `@utils/features/bankTransactions/taxCode`,
`@utils/shared/i18n/date/patterns`. There are no barrel `index.ts` files, so a helper's path is
how you import it.

## Does it belong in `utils` at all?

Work down this list and stop at the first that fits:

1. **An API contract, or a type derived from one** → `src/schemas/<domain>/`.
2. **A React hook** → `src/hooks/features/<domain>/` or `src/hooks/utils/<capability>/`.
3. **A type-level helper** (conditional types, branded types) → `src/types/utility/`.
4. **Used by exactly one component, hook, or provider** → beside that consumer, as its
   `utils.ts` / `formUtils.ts` / its own file in that directory. A 10-line helper with one
   importer does not earn a shared namespace.
5. **Used across one feature domain's components and nothing else** → that domain's single
   `utils.ts` at `src/components/features/<domain>/utils.ts`.
6. **Everything else** → here.

The one rule that overrides step 4 and 5: **if `src/hooks/api/**`, `src/msw/**`, or
`src/schemas/**` imports it, it must live in `src/utils`.** Those layers are lint-barred from
importing `@features` and `@providers`, so co-locating the helper would break them.

## `features/` or `shared/`?

A helper belongs in `features/<domain>/` if its logic or its types name a domain object —
`BankTransaction`, `Invoice`, `LedgerEntry`, `Vehicle`. Otherwise it is `shared/<capability>/`.

Domain names reuse the existing camelCase names shared by `@features/*`, `@hooks/features/*`,
`@schemas/*`, and `@providers/*` — `bankTransactions`, `generalLedger`, `customerVendor`. Reuse
one; never invent a near-synonym.

Capability directories name *what the helper operates on*, not where it is used:
`api`, `array`, `date`, `delay`, `form`, `i18n`, `number`, `request`, `size`, `string`,
`styleUtils`, `switch`, `swr`, `time`, `zustand`.

## Conventions

- **Check before adding.** Both roots are small and greppable — extend an existing file rather
  than starting a parallel one. Two helpers with the same name and different signatures is the
  failure mode this directory is most prone to.
- **Colocate the test.** `dateRange.ts` / `dateRange.test.ts`, in the same directory.
- **Never format money, numbers, or dates by hand** — see
  [`shared/i18n/SKILL.md`](shared/i18n/SKILL.md).

## Related

- [`src/hooks/SKILL.md`](../hooks/SKILL.md) — the same features/utils split, for hooks
- [`src/schemas/SKILL.md`](../schemas/SKILL.md) · [`src/components/SKILL.md`](../components/SKILL.md)
- [`src/utils/shared/i18n/SKILL.md`](shared/i18n/SKILL.md) — formatting
