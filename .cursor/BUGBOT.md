# Bugbot review rules for `@layerfi/components`

## Context

`@layerfi/components` is Layer's embeddable React accounting component library, published to npm
from `src/index.tsx`. Consumers nest our components under `LayerProvider`, brand them with CSS
variables, and embed them at arbitrary widths inside their own layouts. Everything here must be
themeable, localizable, responsive, and mountable more than once on a page. Most rules below exist
to protect one of those four properties.

Stack: React 18, SWR (server state), Zustand (UI state), Effect `Schema` (every API contract),
TanStack Form/Table, SCSS. Tests run on Vitest with MSW; UI coverage is mostly Storybook and
Chromatic. Full conventions live in [`AGENTS.md`](../AGENTS.md) and the colocated `SKILL.md` in
each directory. [`.augment/code_review_guidelines.yaml`](../.augment/code_review_guidelines.yaml)
is this same rule set in Augment's format — keep the two in sync.

## What to flag

### Money, numbers, and dates

- Currency values that are not cents, or percent values that are not fractions. Everything in this
  codebase uses cents and fractions. A currency input handed dollars, or a percent input handed
  `7` instead of `0.07`, is a real bug — check unit consistency wherever a monetary or percentage
  value crosses a boundary.
- Currency, percentages, numbers, or dates formatted by hand: string concatenation, `toFixed`,
  inline `Intl.NumberFormat`, `toLocaleDateString`. Use `useIntlFormatter()` or `<MoneySpan>`.
  Hand-formatting breaks localization for consumers.
- A date formatter given a format string. Pass a `DateFormat` enum value.
- Raw `BigDecimal` held in form or React state. It triggers TS2589 (excessively deep type
  instantiation). Use `NonRecursiveBigDecimal` and thread the rich type as a prop.

### Strings

- A user-visible string that does not go through `t('ns:category.key', 'Default')` with an inline
  default. This includes `aria-label`, `title`, `placeholder`, table headers, and empty-state copy.
  A hardcoded string is untranslatable for consumers.
- A hand edit to the translation JSON under `src/assets/locales`. It is generated from the `t()`
  inline defaults and Crowdin, so the edit is overwritten on the next extract; the string belongs
  in the `t()` call. (`src/assets/locales/SKILL.md` is hand-maintained — leave it alone.)

### API contracts

- An optional or nullable API field declared as anything other than `Schema.NullishOr`. The backend
  omits a field on one endpoint and returns `null` on another; anything narrower has broken
  decoding before.
- A method file under `src/hooks/api/**` with no matching MSW handler at the mirrored path in
  `src/msw/api/**`, registered in the enclosing `handlers.ts`. Unhandled `layerfi.com` requests
  hard-fail Vitest and Storybook, and `npm run msw:check-coverage` fails CI.
- A schema that looks invented rather than derived from a known contract. Say the API contract
  should be confirmed before the schema lands.
- A wire-format type added under `src/types/**`. That directory is internal-only types. Anything
  the API sends or receives is an Effect schema in `src/schemas`.

### Mocks, fixtures, and test payloads

- Hand-written snake_case JSON where a decoded value belongs — mocks, fixtures, `*.storyData.tsx`,
  component tests. Mocks hold decoded values and encode through the schema, so wire-format changes
  propagate automatically. Schema decoder tests under `src/schemas` are the exception: they must
  supply encoded wire payloads to exercise decoding, so snake_case there is correct.
- A value import of `@api/*` or `@hooks/*` inside `src/msw`. Type imports are fine. Handlers load
  before per-test mocks apply, so a runtime import breaks unrelated Vitest suites.
- A change to a fixture schema or generator without regenerated, committed
  `src/fixtures/generated/*.gen.ts`. Run `npm run fixtures:generate`; CI fails on staleness.

### State and data

- `useSWR` or `fetch` in feature code. Use the factories in `@hooks/utils/swr` —
  `createQueryHook`, `createInfiniteQueryHook`, `createMutationHook`. They own auth, `businessId`,
  locale cache keying, and error handling.
- `businessId` or auth passed down as a prop. Both are injected by the provider stack; threading
  them works around the injection.
- Server data mirrored into a Zustand store. SWR owns server state. A duplicate goes stale and
  diverges from the cache.
- `setState` called during render. Use an effect, or derive the value.
- `useEffect` plus `setState` producing a value that could be derived during render from props or
  existing state. Derived values are always consistent and skip the extra render.
- A mutation that does not invalidate the caches it affects. Use
  `createResourceGlobalCacheActions` with `useOnTriggerSuccess`; an uninvalidated write leaves
  stale data on screen.
- `useCallback` or `useMemo` on a primitive, or on anything that is not a prop to a `memo()`ed
  child, a dependency-array entry, or a genuinely expensive computation. Conversely, flag an
  unmemoized object or array literal returned from a custom hook — it breaks every consumer's
  dependency arrays.

### Components and styling

- A consumer-facing component config hidden or removed behind context, a view-level config that
  ambiguously controls several configurable subcomponents, or one prop added per styling knob.
  Components take one nested config explicitly; composed views forward targeted configs through
  `slotProps`, with separate configs when instances may differ. Use context only for genuinely
  implicit, subtree-stable dependency injection.
- New markup that duplicates an existing `@ui` primitive. Reach for `HStack`/`VStack` instead of a
  raw `div`, and `Span`/`P`/`Label`/`Header` instead of raw text elements. Genuinely new reusable
  primitives go in `src/components/ui`, not inside a feature.
- The `style` prop, inline styles, utility class strings, or class names built by concatenation.
  Consumers restyle us by class name; concatenated names are ungreppable and unthemeable.
- Hardcoded hex colors or pixel spacing. Both come from `src/styles/variables.scss`, or consumer
  theming breaks.
- A variant expressed as a conditional class name. Use `data-*` attributes via `toDataProperties`
  and select on them in SCSS.
- `&__Element` nesting in SCSS. Nest only modifiers of the current selector — a name built by
  concatenation cannot be found by searching for it.
- A new data-dense surface — table, list, selection or filter UI — with only a desktop layout that
  reflows. We are embedded at arbitrary widths, so desktop-only is broken for a real subset of
  users. Render per-size variants with `ResponsiveComponent`
  (`@components/utility/ResponsiveComponent`) using a `slots` record and a `resolveVariant`
  function.
- A hand-built mobile card list or bottom sheet. `MobileList`, `PaginatedMobileList`,
  `MobileListItem`, and `MobileListSection` are in `@blocks/MobileList`; `MobileSelectionDrawer`
  and `MobileSelectionDrawerWithTrigger` are in `@blocks/MobileSelectionDrawer`. A bespoke one
  diverges from the rest of the library's mobile behavior.
- Hardcoded pixel thresholds or inline width ternaries scattered through JSX. Size classes come
  from `BREAKPOINTS` in `@utils/shared/size/screenSizeBreakpoints` (mobile under 500, tablet under
  760, desktop above); read element size with `useElementSize` or `useElementViewSize`.
- CSS variables referenced outside a `.Layer__component` or `.Layer__Portal` ancestor. Portals and
  bare primitives rendered outside one silently lose all theming.
- Hand-rolled loading, empty, or error branches. Use `ConditionalBlock` for a single data object
  and `ConditionalList` for an array, with `DataState`, `SkeletonLoader`, and
  `SkeletonTableLoader` for the visuals.
- A hand-built table, or pagination state managed by hand. Use `SimpleDataTable`, `DataTable`,
  `PaginatedDataTable`, `ExpandableDataTable`, or `VirtualizedDataTable`, and take pagination
  state from `@hooks/utils/pagination`.
- A form not built on `useAppForm` plus the `Form*Field` components, or a validator reimplemented
  inline instead of taken from `@utils/shared/form/validators`.

### TypeScript

- An `as` cast with no short comment saying why it is safe. Unexplained casts at boundaries hide
  decoding bugs.
- A type restated by hand where it could be derived: `typeof Schema.Type`,
  `Parameters<typeof useHook>[0]`, `Pick<…>`, `ReturnType<…>`. Restated types drift from their
  source.

### Published API and stories

- Any addition, removal, or rename in the exports of `src/index.tsx`. Say plainly that this is a
  public API change for `@layerfi/components` consumers and must be called out in the PR
  description.
- One story per primitive variant. Every story is a billed Chromatic snapshot — pack variants into
  a single gallery story.

## What to leave alone

- Anything ESLint, stylelint, or `tsc --noEmit` already fails the PR on. Say nothing about import
  order, import boundaries, relative-parent imports, `react-hooks/exhaustive-deps`,
  `no-explicit-any` and the `no-unsafe-*` family, inline type imports, unused variables, quotes,
  semicolons, indentation, line length, or CSS property order.
- `src/fixtures/generated/*.gen.ts` — generated output, committed on purpose.
- `consumer-fixtures/**` — deliberately minimal smoke apps, outside the lint config.
- `*scratch.stories.tsx` — these are expected on a branch and are stripped automatically on
  approval.
- `dist/`, `storybook-static/`, `package-lock.json`, `.claude/`.

## Tone

Be direct. Name the line. Suggest a specific fix. Do not write "consider," do not write "you may
want to," do not summarize the PR. If nothing is worth flagging, say nothing.
