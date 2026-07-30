---
name: schemas
description: Effect Schema conventions for API contracts — snake_case↔camelCase, enums, envelopes, recursion, BigDecimal
applies_to: src/schemas/**
---

# Schemas

Every API contract is an Effect `Schema`. The schema is the single source of truth: the
decoded type, the wire type, the fixture generator (`Arbitrary`), and the MSW encoder all
derive from it. Never hand-write a parallel `interface` for a payload that has a schema.

**Before writing a schema for a backend response, stop and ask the user for the API
contract.** Do not guess field names, nullability, or enum members.

## Where things live

| Thing | Location |
| --- | --- |
| Schema definitions | `src/schemas/**` (`src/schemas/customer.ts`, `src/schemas/invoices/invoice.ts`) |
| Shared building blocks | `src/schemas/utils.ts`, `src/schemas/common/pagination.ts` |
| Internal-only TS types (no wire format) | `src/types/**` — a plain `type`/`interface` is correct here; don't reach for Schema |

Import with the `@schemas/*` alias. `src/schemas` must stay importable from anywhere
(hooks, components, MSW, fixtures), so it may not import from `@hooks`, `@components`, or
`@msw`.

## Field naming

The backend speaks `snake_case`; the app speaks `camelCase`. Bridge it in the schema, not
at the call site:

```ts
import { pipe, Schema } from 'effect'

export const CustomAccountSchema = Schema.Struct({
  accountName: pipe(Schema.propertySignature(Schema.String), Schema.fromKey('account_name')),
  userCreated: pipe(Schema.propertySignature(Schema.Boolean), Schema.fromKey('user_created')),
})
```

Export both types when callers need the wire shape (e.g. to build a request body):

```ts
export type CustomAccount = typeof CustomAccountSchema.Type
export type RawCustomAccount = typeof CustomAccountSchema.Encoded
```

Mutation bodies are `Pick<RawThing, 'snake_case_key' | …>` — bodies are sent in wire
shape, so derive them from `Encoded`, never from `Type`.

## Optional and nullable fields

**Default to `Schema.NullishOr(T)`.** Prefer it to `Schema.NullOr` or `Schema.UndefinedOr`.
The backend may omit a field entirely on one endpoint and return it as an explicit `null` on
another, and that difference is rarely documented; `NullishOr` accepts both, so the schema
doesn't fail to decode the first time a serializer changes.

```ts
export const AccountInstitutionSchema = Schema.Struct({
  name: Schema.String,
  logo: Schema.NullishOr(Schema.String),
})
```

Reach for the narrower forms only when a contract genuinely distinguishes the two states —
e.g. a PATCH body where `null` means "clear this field" and absent means "leave unchanged".
`Schema.optional(T)` (key may be missing) composes with them and is the right tool for
"this key is only present sometimes".

## The shared schema utils

### `@schemas/utils`

| Util | What it does |
| --- | --- |
| `UnwrappedDataResponseSchema(T)` | Wraps `T` in the standard `{ data: T }` envelope and **transforms it away**, so the decoded value is `T` itself — no `.data` at the call site. Round-trips: encoding puts the envelope back. |
| `createOpenEnumSchema(EnumObject)` | Types a string field as `T[keyof T] \| (string & {})`. Known members keep autocomplete; unrecognized values decode through unchanged, preserving the raw string for display. Use when you must show whatever the backend sent. |
| `createTransformedEnumSchema(enumSchema, enumObject, defaultValue)` | Decodes a non-empty string, mapping any value outside the enum to `defaultValue`. Use when downstream code branches on the enum and needs a guaranteed-known member. |

Between the two enum helpers: `createOpenEnumSchema` when the value is passed through for
display, `createTransformedEnumSchema` when it drives logic. A bare
`Schema.Enums`/`Schema.Literal` hard-fails on an unknown member and takes down the whole
view — only use it where the contract is closed and versioned.

### `@schemas/common/pagination`

- `PaginatedResponseSchema(T)` — `{ data: T[], meta?: { pagination } }`, the shape
  `createInfiniteQueryHook` expects.
- `PaginatedResponseMetaSchema` / `PaginatedResponseMeta` — `cursor`, `hasMore`, `totalCount`.
- `PaginatedResponse<A>` — the decoded type, used as the constraint on `SWRInfiniteResult`.

Keep list and single-item response schemas separate; don't try to make one schema serve both.

### `@schemas/common` date types

The app uses `@internationalized/date` values, not `Date`, wherever a value is a calendar
day or a zoned instant:

- `CalendarDateSchema` — wire `"2025-11-16"` ↔ `CalendarDate`.
- `CalendarDateFromSelf` / `ZonedDateTimeFromSelf` — `Schema.declare` guards for values
  already in class form (form state, function boundaries). No transformation.

Use `Schema.Date` only for true timestamps.

### `@schemas/nonRecursiveBigDecimal`

`BigDecimal`'s type is recursive enough to blow up TS inference in React state and TanStack
Form values (TS2589). `NonRecursiveBigDecimal` is the flat `{ value: bigint, scale: number }`
stand-in, with `NonRecursiveBigDecimalSchema` plus:

- `toNonRecursiveBigDecimal` / `fromNonRecursiveBigDecimal` — convert at the boundary
- `convertCentsToNonRecursiveBigDecimal` / `convertNonRecursiveBigDecimalToCents`
- `makeNonRecursiveBigDecimal`, `negateNonRecursiveBigDecimal`, `nrbdEquals`, `NRBD_ZERO`, `NRBD_ONE`

Do arithmetic by converting to `BigDecimal` (or via `@utils/bigDecimalUtils`); never operate
on `value`/`scale` directly.

### `@schemas/common/lineItem`

`LineItemSchema` is the canonical recursive report tree, and `decodeLineItemWithId` is the
pattern for augmenting a decoded tree (here, stamping a stable `id`) as an `Effect` rather
than mutating after decode.

### Other shared pieces

- `@schemas/common/accountInstitution` — `AccountInstitutionSchema` (`name`, nullish `logo`)
- `@schemas/common/s3PresignedUrl` — `S3PresignedUrlSchema` for upload/download flows
- `@schemas/accountIdentifier`, `@schemas/tag`, `@schemas/place` — cross-domain value objects
  reused by several features; check here before writing a new struct.

## Recursive schemas (trees)

Reference implementation: `src/schemas/reports/unifiedReport.ts`. The naive
`columns: Schema.Array(Self)` fails — the schema isn't defined yet when the expression
evaluates.

1. Extract the non-recursive fields into a const bag.
2. Declare a paired `interface` for the decoded `Type` and the `Encoded` wire shape, each
   extending `Schema.Struct.{Type,Encoded}<typeof fields>` and adding the recursive
   `ReadonlyArray` by hand. These must be `interface`s — only interfaces can self-reference.
3. Wrap the recursive arm in `Schema.suspend` with an explicit return-type annotation
   tying the interfaces back to the schema.

```ts
const unifiedReportColumnFields = {
  columnKey: pipe(Schema.propertySignature(Schema.String), Schema.fromKey('column_key')),
}

export interface UnifiedReportColumn extends Schema.Struct.Type<typeof unifiedReportColumnFields> {
  columns?: ReadonlyArray<UnifiedReportColumn>
}
export interface UnifiedReportColumnEncoded extends Schema.Struct.Encoded<typeof unifiedReportColumnFields> {
  readonly columns?: ReadonlyArray<UnifiedReportColumnEncoded>
}

export const UnifiedReportColumnSchema = Schema.Struct({
  ...unifiedReportColumnFields,
  columns: Schema.optional(
    Schema.Array(
      Schema.suspend((): Schema.Schema<UnifiedReportColumn, UnifiedReportColumnEncoded> => UnifiedReportColumnSchema),
    ),
  ),
})
```

## Money

Monetary values that must not lose precision use `NonRecursiveBigDecimal`
(`src/schemas/nonRecursiveBigDecimal.ts`) with the `fromNonRecursiveBigDecimal` /
`toNonRecursiveBigDecimal` converters in the same module and the helpers in
`@utils/bigDecimalUtils`. A plain `BigDecimal` in form state or React state is recursive
enough to blow up TS inference — hence the non-recursive wrapper.

Amounts that arrive as integer cents stay integer cents; formatting divides by 100
(see [`src/utils/i18n/SKILL.md`](../utils/i18n/SKILL.md)).

## Related

- [`src/hooks/SKILL.md`](../hooks/SKILL.md) — how schemas get wired into query/mutation hooks
- [`src/msw/SKILL.md`](../msw/SKILL.md) — mock handlers encode fixtures back through the schema
- [`src/fixtures/SKILL.md`](../fixtures/SKILL.md) — generators derive `Arbitrary` from the schema
- [`src/utils/i18n/SKILL.md`](../utils/i18n/SKILL.md) — formatting the values these schemas carry
