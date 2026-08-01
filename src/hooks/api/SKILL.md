---
name: data-loading
description: Data loading — SWR hook factories (query/infinite/mutation), cache tags, global cache actions, hook file layout and return conventions
applies_to: src/hooks/api/**
---

# Data loading

All server data flows through SWR, and every API hook is built from one of three factories. 
Do not call `useSWR`, `useSWRInfinite`, or `useSWRMutation` directly in feature code, and do 
not call `fetch` outside `src/utils/api`.

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
src/hooks/api/businesses/[business-id]/custom-accounts/useGetCustomAccounts.ts
src/hooks/api/businesses/[business-id]/custom-accounts/usePostCustomAccount.ts
src/hooks/api/businesses/[business-id]/invoices/[invoice-id]/void/useVoidInvoice.tsx
```

One hook per file, named after the operation. `src/msw/api/**` mirrors the same tree, so
a new endpoint gets a hook and a mock at matching paths.

Other hook directories:

- `src/hooks/features/**` — feature logic composed from API hooks and stores (not raw fetching)
- `src/hooks/utils/**` — generic hooks (`auth`, `dates`, `debouncing`, `i18n`, `pagination`, `react`, `size`, `swr`, `tables`, `visibility`)
- `src/hooks/legacy/**` — pre-factory hooks. Don't add to it; migrate when you touch one.

## Anatomy of a query hook

A hook module has four parts, in this order. `useGetCustomAccounts.ts` is the reference.

1. **The tag key**, exported as a `const` (`'#custom-accounts'`) so mutations elsewhere can
   reference it.
2. **The response schema**, usually wrapping a struct in `UnwrappedDataResponseSchema`.
3. **The request**, built with `getWithQuery<TEncoded, TParams>(pathParamKeys, buildPath)` — never
   hand-rolled. Alternatives: `get`/`post`/`patch`/`put`/`del` from `@utils/api/authenticatedHttp`.
4. **The factory call**, plus the resource's cache actions.

```ts
export const useGetCustomAccounts = createQueryHook({
  tags: [CUSTOM_ACCOUNTS_TAG_KEY],
  request: getCustomAccounts,
  schema: GetCustomAccountsResponseSchema,
  select: ({ customAccounts }) => customAccounts,
  keyDefaults: { userCreated: true },
})
```

The config options that matter most:

| Option | Effect |
| --- | --- |
| `tags` | marks the cache entries so global cache actions can find them |
| `schema` | decodes the response; omit for endpoints without one |
| `select` | where you unwrap the envelope, so callers get data rather than `{ data }` |
| `keyDefaults` | params fixed for every caller; a call-site param overrides them |
| `isLocalized` | locale is in the key by default — only disable for locale-independent endpoints |
| `isEnabled: false` | suspends the request without unmounting the caller |

Two things to internalize:

- **`businessId` and auth are injected** from context via `useBuildKeyInputs`. Never pass them
  from a component.
- **Query strings go through `toDefinedSearchParameters`**, which handles camelCase→snake_case,
  drops nullish values, and formats `Date`s. Don't build a query string by hand.

## Paginated lists (`createInfiniteQueryHook`)

Same four parts, with `PaginatedResponseSchema(T)` as the response schema and
`createInfiniteQueryGlobalCacheActions<TItem>` for the cache actions. `useGetInfiniteInvoices.tsx` is the
reference.

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
— see [`src/msw/SKILL.md`](../../msw/SKILL.md).

Don't confuse cursor pagination with **page-index UI**. `@hooks/utils/pagination` slices an
already-loaded array into pages for a pager control (`usePaginatedList`, `usePaginationState`,
`useTablePaginationProps`, `useAutoResetPageIndex`) and is unrelated to fetching. A screen may
use both: `createInfiniteQueryHook` to load, then a paginated table to display.

## Cache tags

Every hook declares a `tags` array, and the tag key is exported as a `const` from the hook module
so mutations elsewhere can reference it. Mutation tags derive from the query tag
(`` `${CUSTOM_ACCOUNTS_TAG_KEY}:create` ``).

Tags are what make invalidation work across modules: a tag predicate finds every cache entry
carrying that tag — including all pages of an infinite query — without anyone reconstructing a
cache key. That's why you never call SWR's `mutate` with a hand-built key.

## Cache invalidation helpers

Create these next to the query hook and export them; mutations import them by name.

`createResourceGlobalCacheActions<TResource>(tagKey)` — for a `createQueryHook`:

| Action | Does |
| --- | --- |
| `invalidate(options?)` | revalidates every matching key, without writing to the cache itself |
| `forceReload()` | revalidates and populates the cache with the result |
| `overwriteCache(data, options?)` | replaces the cached value outright |
| `patchCache(transform, options?)` | maps the cached value through a transform |

`createInfiniteQueryGlobalCacheActions<TItem>(tagKey)` — for a `createInfiniteQueryHook`. **A
different API**, because it operates on items across pages rather than one value, and it requires
`TItem extends { id: string }`:

| Action | Does |
| --- | --- |
| `invalidate(options?)` | revalidates, flagging **every loaded page** to refetch, not just the first |
| `forceReload()` | revalidates and populates the cache with the result |
| `patchByKey(updatedItem, options?)` | replaces the item with a matching `id`, in whatever page holds it |
| `patchByTransformation(transformItem, options?)` | maps every item on every page |
| `optimisticallyUpdate(transformItem)` | applies a transform to displayed data only, without writing the cache |

Both return a memoized object, so destructuring and putting an action in a dependency array is
safe. Rename on destructure when a mutation touches more than one resource
(`const { invalidate: invalidateCustomAccounts } = …`).
### Choosing an action

- **`invalidate`** — the safe default after a write. The server is the source of truth, and for an
  infinite query it's the only action that refetches every loaded page rather than just the first.
- **`forceReload`** — when you want the refetch to write straight through to the cache.
- **`patchByKey` / `patchCache`** — you already have the authoritative object (a mutation response)
  and want it visible without a round trip. Pass `{ withRevalidate: false }` to skip the
  follow-up refetch when you're confident it matches the server.
- **`optimisticallyUpdate`** — before a write lands. It touches displayed data only, so a failure
  reverts on the next revalidation. Pair with `invalidate({ withPrecedingOptimisticUpdate: true })`
  so the invalidation doesn't clobber the optimistic value.

### Where invalidation goes

In the mutation's `useOnTriggerSuccess`, not the component. It's a hook, so it can call other
cache-action hooks, and its returned callback needn't be memoized:

```ts
useOnTriggerSuccess: () => {
  const { invalidate: invalidateCustomAccounts } = useCustomAccountsGlobalCacheActions()
  const { invalidate: invalidateBankAccounts } = useBankAccountsGlobalCacheActions()

  return () => {
    void invalidateCustomAccounts()
    void invalidateBankAccounts()
  }
}
```

`void` the promises for fire-and-forget; `await` only when `trigger` must not resolve before the
refetch lands. A write that changes a second resource should invalidate that one too — creating a
custom account invalidates bank accounts, because the new account appears in both lists.

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


## Related

- [`src/schemas/SKILL.md`](../../schemas/SKILL.md) — the response/body contracts these hooks decode
- [`src/providers/SKILL.md`](../../providers/SKILL.md) — where UI state lives instead
- [`src/msw/SKILL.md`](../../msw/SKILL.md) — mocking these endpoints
- [`AGENTS.md`](../../../AGENTS.md) — TypeScript, imports, and CI conventions
