---
name: fixtures
description: Fixture conventions — handwritten factories vs schema-driven generators, committed .gen.ts files, arbitraries, fixed dates
applies_to: src/fixtures/**
---

# Fixtures

## Choose the right type of fixture

| Choose | When | Where it lives |
| --- | --- | --- |
| a **factory** | the test asserts on the values | `<domain>/mocks.ts` |
| a **generator** | you need volume and variety — Storybook, list/table/pagination states | `<domain>/schema.ts` + `<domain>/generator.ts` → `generated/<domain>.gen.ts` |

Never assert against generated rows: they exist to fill a list, and the values will change the
moment the generator does. Reach for a factory the moment a test cares what a value is.

Type every fixture in **decoded** form (`Customer`, not `RawCustomer`) — MSW encodes it through the
schema on the way out.

## Writing a factory

Declare one explicit base object and wrap it in `createFixtureFactory`:

```ts
const baseCustomer: Customer = { id: '00000000-0000-4000-8000-000000000001', … }

export const { make: makeCustomer, makeMany: makeCustomers } = createFixtureFactory(baseCustomer)
```

Call `make(overrides?)` for one row and `makeMany(count, overrides | (index) => overrides)` for
several. Keep the base readable and stable so tests can assert on it directly. Reuse shared types
(`DateRange`, etc.) instead of re-declaring shapes, and keep rows as keyed objects.

## Writing a generator

Layer per-field arbitraries onto the domain's schema, so generated rows are valid by construction —
don't hand-write generated data:

```ts
// schema.ts
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

- Use `withArbitrary(field, arbitrary)` to re-annotate a field's arbitrary while keeping its type and
  `fromKey`. Declare optional fields and fields with defaults explicitly — it rejects them.
- Pass `uniqueBy` whenever duplicate values would look wrong in a list. It throws a descriptive
  error rather than silently returning fewer rows, so widen the value pool if it does.
- Leave the seed alone unless you have a reason: it's fixed, which is what keeps generated rows
  stable across runs. `numRuns` defaults to 10.
- Prefer the shared arbitraries in `@fixtures/utils/arbitrary/*` — `id` (use `FixtureIdPrefix` so
  generated ids are recognizable per domain), `contactFields`, `amount`, `date`, `calendarDate`,
  `mask`, `nullable`, `nullableConstantFrom`.
- Put value pools (names, memos, institutions, addresses) in `<domain>/constants.ts` or
  `@fixtures/constants/**` and share them across domains.
- Reach for `createRollTable(cases)` when a uniform spread would look fake — weight the cases
  instead (mostly-paid invoices with a few overdue).
- Use `spreadDateAcrossYear(year, index, total)` to distribute dates across a year.

## Regenerate and commit

`src/fixtures/generated/*.gen.ts` is committed and header-marked `AUTO-GENERATED … Do not edit by
hand`. **Never edit those files** — change the schema or the generator instead, then:

```
npm run fixtures:generate     # rewrite the .gen.ts files
npm run fixtures:check        # fail if any is stale (CI: fixtures.yml)
```

Commit the regenerated output alongside the change that caused it, or CI fails.

## Pin dates

Anchor fixture dates to `FIXTURE_YEAR` / `FIXTURE_YEAR_RANGE` (`@fixtures/constants/fixtureYear`).
Never derive fixture data from the real clock — stories and snapshots drift as time passes. When a
*test* needs a fixed now, use `setupFakeSystemTime` with the constants in `@testUtils/dates/fixedDates`.

## Related

- [`src/msw/SKILL.md`](../msw/SKILL.md) — handlers and stores that serve these fixtures
- [`src/schemas/SKILL.md`](../schemas/SKILL.md) — the schemas generators derive from
- [`src/testUtils/SKILL.md`](../testUtils/SKILL.md)
