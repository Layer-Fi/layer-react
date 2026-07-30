---
name: api-mocking
description: MSW mocking — route-mirroring file layout, createMockEndpoint, stateful mock stores, list filters/sorters, response envelopes
applies_to: src/msw/**
---

# API mocking (MSW)

One MSW handler set serves both vitest (`src/msw/node.ts`) and Storybook
(`.storybook/preview.tsx`). Unhandled requests to `layerfi.com` **fail loudly** in both, so
every endpoint a component touches needs a mock.

## File layout mirrors the API route

`src/msw/api/**` mirrors the REST path exactly, matching `src/hooks/api/**`, one file per
HTTP method:

```
src/msw/api/businesses/[business-id]/customers/get.ts
src/msw/api/businesses/[business-id]/customers/post.ts
src/msw/api/businesses/[business-id]/customers/patch.ts
src/msw/api/businesses/[business-id]/customers/store.ts     stateful seed
src/msw/api/businesses/[business-id]/customers/handlers.ts  collects this directory
```

Each `handlers.ts` re-exports its directory's handlers; the parent `handlers.ts` spreads the
children, up to `src/msw/handlers.ts`. **Adding an endpoint means registering it in the
enclosing `handlers.ts`** — otherwise it silently 404s.

## `createMockEndpoint`

Every endpoint is defined once with `createMockEndpoint` (`@msw/utils/createMockEndpoint`),
which returns `{ path, handler, mock, mockError }`:

```ts
const encodeCustomer = Schema.encodeSync(CustomerSchema)

const toResponse = (customers: readonly Customer[], request: Request) =>
  paginatedApiData(customers.map(encodeCustomer), request)

const filterCustomers = createListFilter<Customer>({
  q: matchesQuery(customer => [customer.individualName, customer.companyName, customer.email]),
})

export const get = createMockEndpoint<readonly Customer[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/customers',
  resolve: ({ override: customers = customerStore.all(), request }) =>
    toResponse(filterCustomers(customers, request), request),
})
```

- `handler` — the default, registered in `handlers.ts`.
- `mock(override, { onRequest })` — a runtime handler for `server.use(...)` in one test.
  `onRequest` receives a cloned request, so a test can spy on the body it sent.
- `mockError(body, { status, onRequest })` — failure-state handler (defaults to 500).
- **Paths must start with a bare `*` wildcard** (no space) so they match any base URL.
- The `override` param is the value a test passes to `.mock(...)`; default it to the store so
  the default handler stays stateful.

## Fixtures go out through the schema

Mock data is held in **decoded** form (fixtures are typed as `Customer`, not
`RawCustomer`) and encoded on the way out with `Schema.encodeSync(TheSchema)`. This keeps the
mock honest: if the schema's wire mapping changes, mocks change with it. Never hand-write a
snake_case JSON literal.

Wrap the payload with the response helpers from `@msw/utils/apiResponse`:

- `apiData(payload)` → `{ data: payload }`
- `paginatedApiData(items, request, pageSize?)` → `{ data, meta.pagination }` with real
  cursor/limit handling, so infinite-scroll paths actually paginate.

## Stateful stores

`createMockStore(seed, { getId? })` (`@msw/utils/createMockStore`) gives an endpoint set a
mutable in-memory collection: `all`, `findById`, `save`, `patchById`, `deleteById`. A POST
followed by a GET reflects the write, so multi-step flows work in tests and Storybook.

Every store registers a reset callback; `resetMockStores()` restores seeds and is already
wired into `afterEach` in `vitest.setup.ts` and Storybook's `loaders`. Never reset by hand.

For CRUD boilerplate use `@msw/utils/createStoreResolvers`:
`createStoreCreateResolver`, `createStoreUpdateResolver`, `createStoreDeleteResolver`
(optionally `markDeleted` for soft deletes), `createStoreTransformResolver` (state
transitions such as void/finalize). They accept a `store`, a `makeBase(id)`, a
`fromRequest`, and a `toResponse`, and handle the `override` short-circuit for you.
`createRequestBodyEcho(decode)` builds a `fromRequest` that merges the posted body onto the
base, normalizing `undefined` to `null`.

## Query-param behaviour

Don't ignore query params — components rely on filtering and sorting round-tripping:

- `createListFilter({ param: predicate })` with the shared predicates `matchesQuery`,
  `matchesBoolean`, date/enum matchers in `@msw/utils/createListFilter`. Predicates are
  skipped when the param is absent or empty.
- `createListSorter(keys, defaultKey)` reads `sort_by`/`sort_order`.
- `resolveEmbedded({ requestedId, fallback, lookup })` for endpoints that optionally expand a
  related entity — distinguishes "param omitted" from "explicit null".
- `readRequestJson(request)` to read a body.

## Import restrictions

MSW modules **must not import from `@hooks/*`** (value imports; type-only is fine). Handlers
load in every vitest run before per-test mocks apply, so pulling in a hook module breaks
unrelated suites. This is an ESLint error. Share contracts through `@schemas` instead.

`src/msw`, `src/fixtures`, and `src/test-utils` are also banned from production source: app
code cannot import them.

## Response delay

`setMinimumResponseDelay(ms)` is 0 in tests (fast) and 250ms in Storybook (loading states
visible). That delay is the main source of Chromatic flake — see
[`.storybook/SKILL.md`](../../.storybook/SKILL.md).

## Related

- [`src/fixtures/SKILL.md`](../fixtures/SKILL.md) — the data these handlers serve
- [`src/test-utils/SKILL.md`](../test-utils/SKILL.md) — using mocks in tests
- [`src/hooks/SKILL.md`](../hooks/SKILL.md) — the hooks these endpoints back
