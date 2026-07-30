---
name: data-loading
description: Data loading — SWR hook factories (query/infinite/mutation), cache tags, global cache actions, hook file layout and return conventions
applies_to: src/hooks/**
---

# Data loading

All server data flows through SWR, and every API hook is built from one of three
factories. Do not call `useSWR`, `useSWRInfinite`, or `useSWRMutation` directly in feature
code, and do not call `fetch` outside `src/utils/api`.

| Factory | Use for |
| --- | --- |
| `createQueryHook` (`@hooks/utils/swr/createQueryHook`) | a single GET |
| `createInfiniteQueryHook` (`@hooks/utils/swr/createInfiniteQueryHook`) | cursor-paginated GET lists |
| `createMutationHook` (`@hooks/utils/swr/createMutationHook`) | POST / PATCH / PUT / DELETE |

Each factory JSDoc-documents every config option at its definition — read that file before
adding an option you haven't used before. `useVoidInvoice.tsx` is a good end-to-end reference
for a schema-validated mutation.

## File layout mirrors the API route

`src/hooks/api/**` is a literal mirror of the REST path, with bracketed path params as
directory names:

```
src/hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts.ts
src/hooks/api/businesses/[business-id]/custom-accounts/useCreateCustomAccount.ts
src/hooks/api/businesses/[business-id]/invoices/[invoice-id]/void/useVoidInvoice.tsx
```

One hook per file, named after the operation. `src/msw/api/**` mirrors the same tree, so
a new endpoint gets a hook and a mock at matching paths.

Other hook directories:

- `src/hooks/features/**` — feature logic composed from API hooks and stores (not raw fetching)
- `src/hooks/utils/**` — generic hooks (`auth`, `dates`, `debouncing`, `i18n`, `pagination`, `react`, `size`, `swr`, `tables`, `visibility`)
- `src/hooks/legacy/**` — pre-factory hooks. Don't add to it; migrate when you touch one.

## Anatomy of a query hook

```ts
export const CUSTOM_ACCOUNTS_TAG_KEY = '#custom-accounts'

const GetCustomAccountsResponseSchema = UnwrappedDataResponseSchema(CustomAccountsDataSchema)

const getCustomAccounts = getWithQuery<
  typeof GetCustomAccountsResponseSchema.Encoded,
  GetCustomAccountsParams
>(
  ['businessId'],                                              // path params
  ({ businessId }) => `/v1/businesses/${businessId}/custom-accounts`,
)

export const useCustomAccounts = createQueryHook({
  tags: [CUSTOM_ACCOUNTS_TAG_KEY],
  request: getCustomAccounts,
  schema: GetCustomAccountsResponseSchema,
  select: ({ customAccounts }) => customAccounts,              // unwrap the envelope here
  keyDefaults: { userCreated: true },
})

export const useCustomAccountsGlobalCacheActions =
  createResourceGlobalCacheActions<ReadonlyArray<CustomAccount>>(CUSTOM_ACCOUNTS_TAG_KEY)
```

Rules that fall out of this:

- **`businessId` and auth are injected.** Never pass them from a component. The factories
  read them from context via `useBuildKeyInputs`.
- **Requests are curried and built with helpers**, not hand-rolled: `getWithQuery` (path
  params + query string) or `get`/`post`/`patch`/`put`/`del` from `@utils/api/authenticatedHttp`.
  Query strings go through `toDefinedSearchParameters`, which handles camelCase→snake_case,
  drops nullish values, and formats `Date`s.
- **`select` is where you unwrap**, so callers get the data, not the envelope.
- **`keyDefaults`** bakes in params fixed for every caller; a call-site param overrides them.
- **Locale is part of the cache key** by default (`isLocalized`), so switching locale
  refetches. Only set `isLocalized: false` for locale-independent endpoints.
- **`isEnabled: false`** suspends the request without unmounting the caller.

## Paginated lists (`createInfiniteQueryHook`)

```ts
export const LIST_INVOICES_TAG_KEY = '#list-invoices'

type ListInvoicesParams = {
  businessId: string
  cursor?: string
} & ListInvoicesFilterParams & Omit<PaginationParams, 'cursor'> & SortParams<SortBy>

const ListInvoicesReturnSchema = PaginatedResponseSchema(InvoiceSchema)

export const useListInvoices = createInfiniteQueryHook({
  tags: [LIST_INVOICES_TAG_KEY],
  request: listInvoices,
  schema: ListInvoicesReturnSchema,
  keyDefaults: { sortBy: SortBy.SentAt, sortOrder: SortOrder.DESC, showTotalCount: true },
})

export const useInvoicesGlobalCacheActions =
  createInfiniteQueryGlobalCacheActions<Invoice>(LIST_INVOICES_TAG_KEY)
```

Differences from `createQueryHook`:

- **`schema` is required**, and must be a `PaginatedResponseSchema(T)` — the factory reads the
  next page's cursor out of `meta.pagination`, so it can't work on an unwrapped shape. There is
  no `select`; unwrapping happens via `flattenedData`.
- **`cursor` is injected per page.** Declare it in the params type but never pass it from a call
  site; the key loader derives it from the previous page.
- Compose the params type from the shared helpers in `@internal-types/utility/pagination`:
  `PaginationParams` (`cursor`, `limit`, `showTotalCount`) and `SortParams<TSortBy>`. Define the
  sortable columns as a local `enum` of wire values (`sent_at`), and pin the default
  sort in `keyDefaults`. Use `SortOrder.ASC`/`DESC` — the `ASCENDING`/`DESCENDING`/`DES` members
  are deprecated. `getNextSortOrder` toggles for a sortable column header.
- Defaults the factory sets: `keepPreviousData: true`, `revalidateFirstPage: false`,
  `initialSize: 1`. Override per call only with a reason.

At the call site, read `flattenedData`, `hasMore`, and `fetchMore` — not `data`, `size`, or
`setSize`. `flattenedData` is memoized and `fetchMore` is a stable reference that no-ops when
there are no more pages, so both are safe in dependency arrays and as props to `memo()`ed
children.

Two things the factory handles so you don't: `usePreserveInfiniteSize` restores the loaded page
count after a locale change (the keys change, which would otherwise snap the list back to page
one), and `useSWRInfiniteResult` scopes the memoized flattening to the calling component rather
than a module-level cache.

For these hooks to paginate against mocks, the MSW handler must respond with `paginatedApiData`
— see [`src/msw/SKILL.md`](../msw/SKILL.md).

Don't confuse cursor pagination with **page-index UI**. `@hooks/utils/pagination` slices an
already-loaded array into pages for a pager control (`usePaginatedList`, `usePaginationState`,
`useTablePaginationProps`, `useAutoResetPageIndex`) and is unrelated to fetching. A screen may
use both: `createInfiniteQueryHook` to load, then a paginated table to display.

## Cache tags and invalidation

Every hook declares a `tags` array; the tag key is exported as a `const` from the hook
module so mutations elsewhere can reference it. Mutation tags derive from the query tag
(`` `${CUSTOM_ACCOUNTS_TAG_KEY}:create` ``).

Pair each resource with cache actions and use those instead of raw `mutate`:

- `createResourceGlobalCacheActions<T>(tagKey)` for a `createQueryHook`
- `createInfiniteQueryGlobalCacheActions<TItem>(tagKey)` for a `createInfiniteQueryHook`

Both return a memoized `{ invalidate, forceReload, overwriteCache, patchCache }`.

Invalidate from the mutation, not the component, via `useOnTriggerSuccess` — it is a hook,
so it can call other cache-action hooks, and its returned callback need not be memoized:

```ts
export const useCreateCustomAccount = createMutationHook({
  tags: [`${CUSTOM_ACCOUNTS_TAG_KEY}:create`],
  request: createCustomAccount,
  schema: CreateCustomAccountResponseSchema,
  useOnTriggerSuccess: () => {
    const { invalidate: invalidateCustomAccounts } = useCustomAccountsGlobalCacheActions()
    const { invalidate: invalidateBankAccounts } = useBankAccountsGlobalCacheActions()

    return () => {
      void invalidateCustomAccounts()
      void invalidateBankAccounts()
    }
  },
})
```

`void` the invalidation promises for fire-and-forget; `await` them only when `trigger`
must not resolve before the refetch lands.

## Hook return values

The factories return `SWRQueryResult` / `SWRInfiniteResult` / `SWRMutationResult` class
instances (`src/types/swr/SWRResponseTypes.ts`), not raw SWR responses:

- Read `isError` — never compare `error` yourself.
- `refetch` is the friendly alias for `mutate`.
- Infinite results expose `flattenedData`, `hasMore`, and `fetchMore`; prefer these to
  `data`/`size`/`setSize`.
- Because they're class instances, **do not destructure a whole result object into a hook
  dependency array**, and do not spread it. Pull the specific getters you need.
- Custom hooks that return an object literal must `useMemo` it, so consumers can depend on
  the return value.

## Mutations at the call site

- `trigger` is stable across renders; safe in dependency arrays.
- Pass `swrOptions: { throwOnError: false }` per call and guard on the returned result
  instead of wrapping `trigger` in `try`/`catch`.
- Unpack `isError` from the mutation result for error UI rather than tracking your own flag.

## Related

- [`src/schemas/SKILL.md`](../schemas/SKILL.md) — the response/body contracts these hooks decode
- [`src/providers/SKILL.md`](../providers/SKILL.md) — where UI state lives instead
- [`src/msw/SKILL.md`](../msw/SKILL.md) — mocking these endpoints
- [`AGENTS.md`](../../AGENTS.md) — TypeScript, imports, and CI conventions
