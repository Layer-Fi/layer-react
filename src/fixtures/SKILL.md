---
name: fixtures
description: Fixture conventions — handwritten factories vs schema-driven generators, committed .gen.ts files, arbitraries, fixed dates
applies_to: src/fixtures/**
---

# Fixtures

Two kinds of fixture data, for two different jobs. Pick deliberately.

| Kind | File | Use for |
| --- | --- | --- |
| **Factory** | `<domain>/mocks.ts` | tests that assert on values. One explicit base object; readable, stable, hand-tuned. |
| **Generator** | `<domain>/schema.ts` + `<domain>/generator.ts` → `generated/<domain>.gen.ts` | volume and variety — Storybook, list/table/pagination states. Deterministic, but not something to assert against. |

Fixtures are typed in **decoded** form (`Customer`, not `RawCustomer`); MSW encodes them
through the schema on the way out.

## Factories

```ts
const baseCustomer: Customer = { id: '00000000-0000-4000-8000-000000000001', … }

export const { make: makeCustomer, makeMany: makeCustomers } = createFixtureFactory(baseCustomer)
```

`createFixtureFactory(base)` returns `make(overrides?)` and
`makeMany(count, overrides | (index) => overrides)`. Keep rows as keyed objects and reuse
shared types (`DateRange`, etc.) rather than re-declaring shapes. Because the values are
fixed and readable, tests can assert on them directly.

## Generators

A generator derives a FastCheck `Arbitrary` from the domain's schema, so generated rows are
valid by construction:

```ts
// schema.ts — the schema with per-field arbitraries layered on
const { _local, ...fields } = CustomerSchema.fields

export const schema = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.customer)),
  companyName: withArbitrary(fields.companyName, () => companyNameArbitrary),
})

// generator.ts
export const generator = createGenerator(schema, {
  uniqueBy: [c => c.id, c => c.individualName ?? c.companyName],
})
```

- `createGenerator(schema, { uniqueBy?, seed?, numRuns? })` — **fixed seed**, so the same
  rows every run. Defaults to 10 rows. `uniqueBy` dedupes by the given keys and throws a
  descriptive error if it can't fill the count, rather than silently returning fewer.
- `withArbitrary(field, arbitrary)` (`@fixtures/utils/arbitrary/withArbitrary`) re-annotates
  a schema field's value arbitrary while keeping its type and `fromKey`. It rejects optional
  fields and fields with defaults — declare those explicitly.
- Shared arbitraries live in `@fixtures/utils/arbitrary/*`: `id` (with `FixtureIdPrefix`, so
  generated ids are recognizable per domain), `contactFields`, `amount`, `date`,
  `calendarDate`, `mask`, `nullable`, `nullableConstantFrom`.
- Value pools (names, memos, institutions, addresses) go in `<domain>/constants.ts` or
  `@fixtures/constants/**` and are shared across domains.
- `createRollTable(cases)` builds a weighted case table for realistic distributions
  (e.g. mostly-paid invoices with a few overdue) instead of a uniform spread.
- `spreadDateAcrossYear(year, index, total)` distributes dates evenly across a year.

## Generated files are committed

`src/fixtures/generated/*.gen.ts` is checked in, header-marked
`AUTO-GENERATED … Do not edit by hand`, and excluded from ESLint.

```
npm run fixtures:generate     # rewrite the .gen.ts files
npm run fixtures:check        # fail if any is stale (CI: fixtures.yml)
```

Change a schema or a generator → regenerate → commit both. The generator script walks every
`generator.ts` and serializes `Date`, `BigDecimal`, and `CalendarDate` as real constructor
calls so values round-trip.

## Dates in fixtures

Fixture data is pinned to `FIXTURE_YEAR` / `FIXTURE_YEAR_RANGE`
(`@fixtures/constants/fixtureYear`), not to the real clock — otherwise stories and snapshots
drift as time passes. Tests that need a fixed *now* use `NOW` and the derived ranges in
`@test-utils/fixedDates` together with `setupFakeSystemTime`.

## Related

- [`src/msw/SKILL.md`](../msw/SKILL.md) — handlers and stores that serve these fixtures
- [`src/schemas/SKILL.md`](../schemas/SKILL.md) — the schemas generators derive from
- [`src/test-utils/SKILL.md`](../test-utils/SKILL.md)
