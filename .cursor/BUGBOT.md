# Bugbot review rules for `@layerfi/components`

## Context

`@layerfi/components` is Layer's embeddable React accounting component library, published to npm
from `src/index.tsx`. Consumers nest our components under `LayerProvider` and brand them with CSS
variables, so **everything must be themeable, localizable, and mountable more than once on a
page**. Most rules below exist to protect one of those three properties.

Stack: React 18, SWR (server state), Zustand (UI state), Effect `Schema` (every API contract),
TanStack Form/Table, SCSS. Tests run on Vitest with MSW; UI coverage is mostly Storybook +
Chromatic. Full conventions live in [`AGENTS.md`](../AGENTS.md) and the colocated `SKILL.md` file
in each directory.

## What to flag

### Money, numbers, and dates

- Currency, percentage, number, or date values formatted by hand — string concatenation,
  `toFixed`, `Intl.NumberFormat` inline, `toLocaleDateString`. Use `useIntlFormatter()` or
  `<MoneySpan>`.
- Currency values that are not **cents**, or percent values that are not **fractions**. A
  currency input handed dollars, or a percent input handed `7` instead of `0.07`, is a bug.
- A date formatter given a format string instead of a `DateFormat` enum value.

### Strings

- Any user-visible string not routed through `t('ns:category.key', 'Default')` with an inline
  default — including `aria-label`, `title`, `placeholder`, table headers, and empty-state copy.
- Edits to `src/assets/locales/**`. Those files are generated from code and Crowdin; the string
  belongs in the `t()` call's inline default.

### Schemas and mocks

- Optional or nullable API fields declared as anything other than `Schema.NullishOr`. The backend
  omits a field on one endpoint and returns `null` on another.
- Hand-written snake_case JSON anywhere it stands in for a wire payload — mocks, fixtures, tests,
  `*.storyData.tsx`. Mocks hold decoded values and encode through the schema.
- A new or renamed method file under `src/hooks/api/**` with no MSW handler at the mirrored path
  in `src/msw/api/**` — and the handler must be **registered in the enclosing `handlers.ts`**.
  Unhandled `layerfi.com` requests fail Vitest and Storybook.
- A changed fixture schema or generator without regenerated, committed
  `src/fixtures/generated/*.gen.ts`.
- Value imports of `@api/*` or `@hooks/*` inside `src/msw`. Handlers load before per-test mocks
  apply and would break unrelated suites. Share contracts through `@schemas`.

### State and data

- `useSWR` or `fetch` called directly in feature code. Use the factories in `@hooks/utils/swr`
  (`createQueryHook`, `createInfiniteQueryHook`, `createMutationHook`).
- `businessId` or auth passed down from a component. Both are injected.
- Server data mirrored into a Zustand store. SWR owns server state, Zustand owns UI state,
  Context is dependency injection.
- `setState` called during render.
- `useEffect` + `setState` producing a value that could be derived during render instead.
- A write with no corresponding cache invalidation (`createResourceGlobalCacheActions` +
  `useOnTriggerSuccess`).

### Memoization

- `useCallback` or `useMemo` wrapping a primitive, or wrapping a value that is neither a prop to
  a `memo()`ed child nor a dependency-array entry nor an expensive computation.
- An object or array literal returned from a custom hook without `useMemo`.

### Components and styling

- New markup that reimplements something already in `@ui`. Build on the primitive; genuinely new
  primitives go in `src/components/ui`.
- Raw `<div>` where `<HStack>`/`<VStack>` fits; raw `<span>`/`<p>`/`<label>` where
  `<Span>`/`<P>`/`<Label>` fits.
- The `style` prop, inline styles, utility class strings, or class names built by concatenation.
- Hard-coded colors or spacing. Both come from `src/styles/variables.scss`.
- Variants expressed as extra class names instead of `data-*` attributes via `toDataProperties`.
- `&__Element` nesting in SCSS. Write flat, greppable selectors; nest only modifiers of the
  current selector.
- A new data-dense surface — table, list, selection or filter UI — with no mobile variant. We are
  embedded at arbitrary widths inside consumer layouts; desktop-only is broken for real users.
  Render per-size variants with `ResponsiveComponent` (`slots` + `resolveVariant`).
- A hand-built mobile card list or bottom sheet. Use `@blocks/MobileList`
  (`MobileList`, `PaginatedMobileList`, `MobileListItem`, `MobileListSection`) and
  `@blocks/MobileSelectionDrawer`.
- Hardcoded pixel thresholds or inline width ternaries scattered through JSX. Size classes come
  from `BREAKPOINTS` in `@utils/shared/size/screenSizeBreakpoints`; read size with
  `useElementSize` / `useElementViewSize`.
- CSS variables referenced outside a `.Layer__component` / `.Layer__Portal` ancestor. Portals and
  bare primitives in stories need one.

### Reuse before reinvention

- Hand-rolled loading, empty, or error branches instead of `ConditionalBlock` (one object),
  `ConditionalList` (an array), `DataState`, `SkeletonLoader`, or `SkeletonTableLoader`.
- A hand-built table instead of `SimpleDataTable` / `DataTable` / `PaginatedDataTable` /
  `ExpandableDataTable` / `VirtualizedDataTable`, or pagination state managed by hand instead of
  `@hooks/utils/pagination`.
- A form not built on `useAppForm` + the `Form*Field` components, or a validator duplicated
  instead of taken from `@utils/shared/form/validators`.

### TypeScript

- An `as` cast with no short comment explaining why it is safe.
- A type restated by hand where it could be derived: `typeof Schema.Type`,
  `Parameters<typeof useHook>[0]`, `Pick<…>`, `ReturnType<…>`.
- Raw `BigDecimal` held in form or React state. It triggers TS2589 — use
  `NonRecursiveBigDecimal`.
- A wire-format type added under `src/types/**`. Anything the API sends or receives is a schema.

### Published surface

- Any change to the exports in `src/index.tsx`. Say plainly that this is a public API change and
  must be called out in the PR description.

### Stories

- One story per primitive variant. Every story is a Chromatic snapshot — pack variants into a
  single gallery story.
- A `*scratch.stories.tsx` file reaching the branch.

## What to leave alone

- Anything ESLint, stylelint, or `tsc --noEmit` already fails the PR on. Do not comment on import
  order, import boundaries, relative-parent imports, `react-hooks/exhaustive-deps`,
  `no-explicit-any` and the `no-unsafe-*` family, inline type imports, unused variables, quotes,
  semicolons, indentation, line length, or CSS property order.
- `src/fixtures/generated/*.gen.ts` — generated output, committed on purpose.
- `consumer-fixtures/**` — deliberately minimal smoke apps, outside the lint config.
- `dist/`, `storybook-static/`, `package-lock.json`.
- `.claude/worktrees/**`.

## Tone

Be direct. Name the line. Suggest a specific fix. Do not write "consider," do not write "you may
want to," do not summarize the PR. If nothing is worth flagging, say nothing.
