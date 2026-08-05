---
name: internal-types
description: Where internal TypeScript types live — features/ vs shared/ vs utility/, and why runtime code doesn't belong here
applies_to: src/types/**
---

# Internal types

`src/types` (`@internal-types/*`) holds internal-only TypeScript types — anything the API sends
or receives is an Effect schema in `src/schemas` instead
([`src/schemas/SKILL.md`](../schemas/SKILL.md)). There is no barrel file; import the module.

```
features/<domain>/   types owned by one feature domain; domain names match src/components/features
shared/              types used across domains (dateRange, money, reporting, s3, viewport,
                     authentication, fileUpload, layerContext, toast)
utility/             type-level helpers (oneOf, promises, enumWithUnknownValues, pagination, table)
ambient/             global declarations (asset modules, the Intl.DurationFormat polyfill)
```

## Where a new type goes

1. Does the API send or receive it? → `src/schemas`, not here.
2. Is it a type-level helper (conditional type, open enum, branded type)? → `utility/`.
3. Is it owned by one feature domain? → `features/<domain>/`, using the same domain name as
   `src/components/features`. If only one file uses it, declare it in that file instead.
4. Used by several domains? → `shared/<capability>.ts`, scoped narrowly. Don't grow a
   `general.ts`-style grab-bag; a module with one exported type is fine.

## Keep runtime code out

This directory should erase at build time. Classes, enums with behaviour, type guards, data
tables and functions belong with the code that owns them:

- option classes and guards → `src/utils/features/<domain>/` (see
  `utils/features/bankTransactions/taxCodeComboBoxOption.ts`)
- SWR result wrappers → `src/hooks/utils/swr/SWRResponseTypes.ts`
- anything importing `@ui/*` or `@providers/*` is a layering smell — types are meant to be a
  leaf layer, below every one of them

A few plain enums (`Direction`, `DisplayState`, `Alignment`, `SortOrder`) do live here because
they're part of a type's contract and are re-exported from the public API; that's the exception,
not the pattern.

## Related

- [`src/schemas/SKILL.md`](../schemas/SKILL.md) — API contracts
- [`src/utils/SKILL.md`](../utils/SKILL.md) — where helpers go
