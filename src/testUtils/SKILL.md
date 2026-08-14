---
name: testing
description: Testing conventions — vitest + Testing Library, query priority, LayerTestProvider as wrapper, MSW per-test mocks, form fillers, fixed clocks
applies_to: src/**/*.test.ts, src/**/*.test.tsx, src/testUtils/**
---

# Testing

`vitest` + `@testing-library/react` + `@testing-library/user-event`, jsdom environment.
Tests are colocated with the code (`CustomAccountForm.test.tsx` next to
`CustomAccountForm.tsx`).

The governing idea: **test what a user can perceive and do, never how the component achieves it.**
Internal state, hook call counts, and prop plumbing are implementation details — asserting on them
breaks under harmless refactors and passes when the wiring is genuinely broken.

```
npm test                        # watch
npm test -- --run               # single pass
npm test -- --run path/to/file  # one file
npm run test:coverage           # single pass + coverage (CI: Checks / Vitest)
```

Coverage floors live in `thresholds` in `vitest.config.ts`. They're a backstop against a real drop,
not a target: a global percentage also moves when the denominator does, so they sit ~1pt below
actual. Raising them is the ratchet, and it's deliberate rather than automatic — `autoUpdate` would
have every concurrent PR rewriting the same four lines.

```
npm run coverage:floor            # headroom between actual and each floor
npm run coverage:floor -- --write # raise any floor with 2pt+ of slack
```

Run it after landing a batch of tests, and commit the raise on its own.

## Helpers

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

## What `vitest.setup.ts` already does

Don't re-implement any of this per file:

- Starts the MSW server with `onUnhandledRequest: 'error'` — **any unmocked request fails the test**.
  Mock every endpoint the component touches, including ones fired by providers above it.
- `afterEach`: `cleanup()`, `server.resetHandlers()`, `resetMockStores()`.
- Stubs `ResizeObserver` globally (jsdom lacks it and the size hooks need it).
- Loads `@testing-library/jest-dom/vitest` matchers.

There is no `globals: true` — import `describe`/`it`/`expect`/`vi` from `vitest` explicitly.

## Rendering

Pass `LayerTestProvider` **directly as the `wrapper`** — don't write a redundant wrapper component
around it. It mounts a real `LayerProvider` against a fake API host with a default theme —
charts and themed surfaces read
`--color-dark`/`--color-light`, which only exist under a theme. Assert against the exported
`TEST_LAYER_BUSINESS_ID` / `TEST_LAYER_API_URL` / `TEST_LAYER_ACCESS_TOKEN`; never hardcode them.

For hooks, use `renderHookWithAuth` (`@testUtils/render/renderHookWithAuth`), which renders inside
`LayerTestProvider` and resolves only once auth has landed — otherwise the first render fires
with no token and the assertions race.

**Every test file defines one render helper at module scope and every `it()` goes through it** —
never call `render` or `renderHookWithAuth` inline in a test. Name it after the subject
(`renderCustomAccountForm`, `renderSplitsForm`), take `Partial<Props>` so each test states only the
props it cares about, and return `user` alongside the RTL result — plus `filler` only when the
subject has form fields:

```tsx
const renderForm = (props: Partial<Props> = {}) => {
  const user = userEvent.setup()

  return {
    user,
    filler: createFormFiller(user), // forms only — drop it for a table, modal, or hook
    ...render(<Thing {...props} />, { wrapper: LayerTestProvider }),
  }
}

const { user, filler } = renderForm({ onSuccess })
```

The same shape works for hooks — wrap `renderHookWithAuth` instead of `render`, and take the hook's
arguments rather than props.

This is what keeps `userEvent.setup()` ahead of `render` in every test without restating it, and it
means a new provider, a required prop, or a changed default is one edit rather than one per `it()`.

## Queries

Always use the highest tier that can find the element. `screen.*` only — never
`container.querySelector`.

| Tier | Query | Use for |
| --- | --- | --- |
| 1 | `getByRole(role, { name })` | **the default for nearly everything** — buttons, textboxes, radios, headings, dialogs |
| 1 | `getByLabelText` | form fields, when the role is ambiguous |
| 1 | `getByPlaceholderText` | only when there is genuinely no label |
| 1 | `getByText` | non-interactive content — copy, cells, error messages |
| 1 | `getByDisplayValue` | asserting a pre-filled value |
| 2 | `getByAltText` / `getByTitle` | images; `title` is a last resort |
| 3 | `getByTestId` | **only** when nothing above can address the element |

`getByRole` matches text split across child elements, and its failure message prints the accessible
tree. Interactive primitives are `react-aria-components`, which already emit correct roles — don't
reach for a test id because the markup is nested.

| Variant | Returns | Use for |
| --- | --- | --- |
| `getBy*` | throws if absent | asserting something **is** there, synchronously |
| `queryBy*` | `null` if absent | asserting something is **not** there — this is its only job |
| `findBy*` | Promise, retries to 1000ms | something that appears **after** an await |

```tsx
expect(await screen.findByText('Account name is required')).toBeInTheDocument()  // appears async
expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()       // already there
expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument() // absent
```

Translations use inline `t()` defaults, so asserting the English string is stable. Don't edit locale
JSON to make a test pass.

## Interactions

`userEvent`, never `fireEvent`. `fireEvent.change` dispatches one synthetic event; `user.type`
fires the real keydown/keypress/input/keyup sequence, respects `disabled` and `pointer-events: none`,
and is what actually catches broken handlers.

Two rules that cause almost every flake:

1. **`userEvent.setup()` before `render`**, once per test, via the render helper above.
2. **`await` every interaction.** An un-awaited `user.click` is the usual source of
   "not wrapped in act(...)".

Use the form fillers (`@testUtils/forms/fillForm`) rather than hand-driving inputs — they know how
each field type is wired (react-aria combo boxes need the listbox resolved via `aria-controls`,
number fields need commit semantics):

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

## Async

Prefer `findBy*`. Reach for `waitFor` only to await something that is *not* a DOM query — typically
a callback or a request spy:

```tsx
await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(MOCK_CUSTOM_ACCOUNT))
expect(onSuccess).toHaveBeenCalledTimes(1)   // settled — assert outside
```

The callback runs repeatedly until it stops throwing, so keep it to **one assertion** (extra ones
delay the failure by the full timeout) and **no side effects** — interact first, then wait.

**Don't reach for `act()`.** RTL already wraps `render` and `user.*`. An act warning means a state
update landed that the test never awaited; the fix is to await the visible consequence. Wrapping in
`act()` silences the warning and leaves the bug.

## Mocking and assertions

Import the endpoint module and use its `mock` / `mockError` builders with `server.use(...)`.
`onRequest` is how you assert on the **request** the app sent — spy there instead of stubbing
`fetch`. Handlers reset automatically after each test.

```tsx
const createAccount = vi.fn()
server.use(postCustomAccount.mock(makeCustomAccount(), {
  onRequest: async ({ request, params }) =>
    createAccount({ body: await readRequestJson(request), businessId: params.businessId }),
}))

// the high-value assertion in a feature test is what the app actually sent
expect(createAccount).toHaveBeenCalledWith({ body: EXPECTED_BODY, businessId: TEST_LAYER_BUSINESS_ID })
```

Use the jest-dom matchers for the DOM — `toBeInTheDocument`, `toBeDisabled`, `toBeChecked`,
`toHaveValue`, `toHaveAccessibleName` — not `expect(el.disabled).toBe(true)`.

## Time

Tests that depend on "now" pin the clock with `setupFakeSystemTime(NOW)`
(`@testUtils/dates/fakeSystemTime`) — it wraps `vi.useFakeTimers()`/`setSystemTime` in
`beforeEach`/`afterEach` for you. Use the pre-derived constants in `@testUtils/dates/fixedDates`
(`NOW`, `END_OF_TODAY`, `CURRENT_MONTH_TO_DATE`, `PREVIOUS_MONTH_RANGE`, …) rather than
constructing dates inline. Existing users pin the clock for pure date logic
(`createScopedDateStore.test.tsx`, `dateRange.test.ts`); if you combine a fake clock with
`userEvent`, pass `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` or interactions
will hang.

## What to test

- Cover the states the UI actually branches on: loading, error (`mockError`), empty,
  permission-gated. Components use `ConditionalBlock`/`ConditionalList`, so those branches are real
  and reachable.
- Unit-test shared utilities and hook factories directly — see the `*.test.ts` files
  alongside `src/utils/swr/*` and `src/hooks/utils/swr/*` for the pattern.
- `src/msw`, `src/fixtures`, and `src/testUtils` may not be imported by production source
  (ESLint enforces it); test files import them freely.

### Anti-pattern quick reference

| Don't | Do |
| --- | --- |
| `render(<Thing />)` inline in each `it()` | one module-scope `renderThing()` helper, used by every test |
| `container.querySelector('.btn')` | `screen.getByRole('button', { name: /save/i })` |
| `getByTestId('submit')` | `getByRole('button', { name: /submit/i })` |
| `fireEvent.change(input, …)` | `await user.type(input, …)` |
| `user.click(...)` un-awaited | `await user.click(...)` |
| `await waitFor(() => screen.getByText('x'))` | `await screen.findByText('x')` |
| `expect(queryByText('x')).toBeInTheDocument()` | `expect(getByText('x')).toBeInTheDocument()` |
| 3 assertions in one `waitFor` | 1 inside, the rest after |
| `user.click` inside `waitFor` | click first, then `waitFor` |
| `act(() => …)` to silence a warning | await the visible consequence |
| `expect(el.disabled).toBe(true)` | `expect(el).toBeDisabled()` |
| `vi.mock('fetch')` | `server.use(endpoint.mock(…, { onRequest }))` |
| asserting hook internals / call counts | assert rendered output and request body |

### When a story beats a test

Story `play:` functions run in CI via `stories:check-render`, and Chromatic covers appearance.
Prefer a story for **appearance or layout**, a vitest test for **logic, branching, or the request
payload**. Only a vitest test moves the coverage number.

## Other helpers

- `getRequestOptions(mock, index?)` (`@testUtils/requests/getRequestOptions`) — pulls the
  `{ params, body }` options off the nth call of a mocked request function.
- `@testUtils/storybook/layout/*` — one module per story-layout component (`Gallery`, `Section`, `Frame`, `Row`, `Col`, `Matrix`, `Label`).
- `@testUtils/storybook/decorators/PinnedGlobalDateRange` — mounts a global date store fixed to a
  known range; `decorators/profitAndLoss` wraps it with the P&L handlers as a decorator.
- `@testUtils/storybook/controls/*` — argTypes and arg→prop builders per feature.
- `@testUtils/storybook/interactions/findEntryRows` — waits past skeleton rows in a play function.

## Related

- [`src/msw/SKILL.md`](../msw/SKILL.md) · [`src/fixtures/SKILL.md`](../fixtures/SKILL.md)
- [`.storybook/SKILL.md`](../../.storybook/SKILL.md) — visual regression coverage
