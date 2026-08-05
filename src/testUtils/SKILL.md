---
name: testing
description: Testing conventions — vitest + Testing Library, LayerTestProvider as wrapper, MSW per-test mocks, form fillers, fixed clocks
applies_to: src/**/*.test.ts, src/**/*.test.tsx, src/testUtils/**
---

# Testing

`vitest` + `@testing-library/react` + `@testing-library/user-event`, jsdom environment.
Tests are colocated with the code (`CustomAccountForm.test.tsx` next to
`CustomAccountForm.tsx`).

```
Helpers live under `src/testUtils` (`@testUtils/*`), one directory per concern — put new ones
where they belong instead of at the root:

```
render/       LayerTestProvider, renderHookWithAuth
dates/        fakeSystemTime, fixedDates
requests/     getRequestOptions
forms/        fillForm + the per-kind fillers behind it
storybook/    layout/ · controls/ · decorators/ · data/ · interactions/
```

Story data used by a single story file belongs next to that story as
`<Component>.storyData.tsx`, not in `storybook/data/` — only genuinely shared rows, column
configs, and slots live there.

```
npm test                        # watch
npm test -- --run               # single pass (CI: vitest.yml)
npm test -- --run path/to/file  # one file
```

Note: the vitest glob excludes `.claude/**`, so agent worktrees are skipped by a bare
`npm test`. Passing explicit file paths still works inside one.

## What `vitest.setup.ts` already does

Don't re-implement any of this per file:

- Starts the MSW server with `onUnhandledRequest: 'error'` — **any unmocked request fails the test**.
- `afterEach`: `cleanup()`, `server.resetHandlers()`, `resetMockStores()`.
- Stubs `ResizeObserver` globally (jsdom lacks it and the size hooks need it).
- Loads `@testing-library/jest-dom/vitest` matchers.

## Rendering

Pass `LayerTestProvider` **directly as the `wrapper`** — don't write a redundant wrapper
component around it:

```tsx
render(<CustomAccountForm initialAccountName='' />, { wrapper: LayerTestProvider })
```

It mounts a real `LayerProvider` against a fake API host with a default theme (charts and
themed surfaces read `--color-dark`/`--color-light`, which only exist under a theme). Exported
constants — `TEST_LAYER_BUSINESS_ID`, `TEST_LAYER_API_URL`, `TEST_LAYER_ACCESS_TOKEN` — are what
you assert against; never hardcode those strings.

For hooks, use `renderHookWithAuth` (`@testUtils/render/renderHookWithAuth`), which renders inside
`LayerTestProvider` and resolves only once auth has landed — otherwise the first render fires
with no token and the assertions race.

A useful render helper shape, returning the user and filler alongside the RTL result:

```tsx
const renderForm = (props: Partial<Props> = {}) => {
  const user = userEvent.setup()

  return {
    user,
    filler: createFormFiller(user),
    ...render(<Thing {...props} />, { wrapper: LayerTestProvider }),
  }
}
```

## Mocking per test

Import the endpoint module and use its `mock` / `mockError` builders with `server.use(...)`:

```tsx
server.use(
  postCustomAccount.mock(makeCustomAccount(), {
    onRequest: async ({ request, params }) => {
      spy({ body: await readRequestJson(request), businessId: params.businessId })
    },
  }),
)
```

`onRequest` is how you assert on the **request** the app sent — spy there instead of stubbing
`fetch`. Handlers reset automatically after each test.

## Filling forms

Use the form fillers (`@testUtils/forms/fillForm`) rather than hand-driving inputs — they
know how each field type is wired (react-aria combo boxes need the listbox resolved via
`aria-controls`, number fields need commit semantics, etc.):

```tsx
const FORM_DATA = [
  { kind: 'text', field: 'Account name', value: 'Operating Account' },
  { kind: 'comboBox', field: 'Account type', option: 'Credit Card' },
] satisfies readonly FillFormSpec[]

await filler.fill(FORM_DATA)
```

Kinds: `text`, `number`, `checkbox`, `toggle`, `radio`, `comboBox`. Fields are addressed by
**accessible label** (string or RegExp), which is also why every field needs a real label.
`createFormFiller(user, scope?)` scopes queries to a subtree. Declare specs as module
constants with `satisfies readonly FillFormSpec[]` so a variant (`…WITHOUT_ACCOUNT_NAME`)
reads as a diff of the base case.

## Time

Tests that depend on "now" pin the clock with `setupFakeSystemTime(NOW)`
(`@testUtils/dates/fakeSystemTime`) — it wraps `vi.useFakeTimers()`/`setSystemTime` in
`beforeEach`/`afterEach` for you. Use the pre-derived constants in `@testUtils/dates/fixedDates`
(`NOW`, `END_OF_TODAY`, `CURRENT_MONTH_TO_DATE`, `PREVIOUS_MONTH_RANGE`, …) rather than
constructing dates inline. Existing users pin the clock for pure date logic
(`createScopedDateStore.test.tsx`, `dateRange.test.ts`); if you combine a fake clock with
`userEvent`, pass `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` or interactions
will hang.

## Other helpers

- `getRequestOptions(mock, index?)` (`@testUtils/requests/getRequestOptions`) — pulls the
  `{ params, body }` options off the nth call of a mocked request function.
- `@testUtils/storybook/layout/*` — one module per story-layout component (`Gallery`, `Section`, `Frame`, `Row`, `Col`, `Matrix`, `Label`).
- `@testUtils/storybook/decorators/PinnedGlobalDateRange` — mounts a global date store fixed to a
  known range; `decorators/profitAndLoss` wraps it with the P&L handlers as a decorator.
- `@testUtils/storybook/controls/*` — argTypes and arg→prop builders per feature.
- `@testUtils/storybook/interactions/findEntryRows` — waits past skeleton rows in a play function.

## What to test

- Query the way a user does: role, label, text. Avoid test ids and class selectors.
- Assert on **behaviour and the request body**, not internal state.
- Cover the states the UI actually branches on: loading, error (`mockError`), empty,
  permission-gated.
- Unit-test shared utilities and hook factories directly — see the `*.test.ts` files
  alongside `src/utils/swr/*` and `src/hooks/utils/swr/*` for the pattern.
- `src/msw`, `src/fixtures`, and `src/testUtils` may not be imported by production source
  (ESLint enforces it); test files import them freely.

## Related

- [`src/msw/SKILL.md`](../msw/SKILL.md) · [`src/fixtures/SKILL.md`](../fixtures/SKILL.md)
- [`.storybook/SKILL.md`](../../.storybook/SKILL.md) — visual regression coverage
