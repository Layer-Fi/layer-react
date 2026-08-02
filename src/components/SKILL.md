---
name: component-architecture
description: Component architecture and UX patterns — the ui/blocks/feature/view layering, loading & empty states, responsive variants, forms, tables, public API
applies_to: src/components/**, src/views/**
---

# Component architecture

## The four layers

| Layer | Path | Alias | Knows about |
| --- | --- | --- | --- |
| **Primitives** | `src/components/ui/**` | `@ui/*` | nothing domain-specific — see [`ui/SKILL.md`](ui/SKILL.md) |
| **Blocks** | `src/components/blocks/**` | `@blocks/*` | composed patterns (`DataTable`, `SummaryCard`, `Wizard`, `ActionableList`) — still domain-agnostic |
| **Features** | `src/components/features/<domain>/**` | `@features/*` | one domain; fetches its own data via hooks |
| **Views** | `src/views/**` | `@views/*` | full pages composing features and mounting providers |
| **Utilities** | `src/components/utility/**` | `@components/utility/*` | rendering helpers, not UI |

Dependencies point one way only: views → features → blocks → ui. A `@ui` component must
never import a schema, a hook that fetches, or a feature component.

**Before creating anything, search for an existing implementation and extend it instead.**
Build on `@ui` and `@blocks` before writing a new component; a new reusable primitive
belongs in `src/components/ui`, not next to the feature that first needed it.

## Finding and placing feature code

`src/components/features/` holds one directory per **domain object**, named with the same
camelCase vocabulary as `src/hooks/features/*` and `src/schemas/*`. So the same domain name
answers "where does this live" in all three trees: bank-transaction components are in
`@features/bankTransactions`, its hooks in `@hooks/features/bankTransactions`, its contracts in
`@schemas/bankTransactions`. **Reuse an existing domain name — do not invent a near-synonym**, and
add a new domain directory only for a genuinely new domain object.

Inside a domain the layout is **flat**: one `PascalCase` directory per component, directly under the
domain, no grouping directories between them. `mileage` is the worked example:

```
features/mileage/
  MileageSummaryCard/ MileageTrackingStats/ MileageDeductionChart/ …
  Trips/ TripsView/ TripsTable/ TripDrawer/ TripForm/ TripPurposeToggle/ …
  VehiclesView/ VehiclesGrid/ VehicleCard/ VehicleForm/ VehicleSelector/ …
  tripUtils.ts
```

Four rules keep that navigable:

- **A component's path is its name.** `@features/mileage/TripDrawer/TripDrawer` — always
  `<domain>/<Name>/<Name>.tsx`, with no exceptions to look up. You can write the import before you
  have looked at the tree, and a wrong guess means the component doesn't exist.
- **Every component gets its own directory, even a one-file one.** Uniformity is the point: a reader
  never has to know whether `TripDrawer` is a file or a directory. A second *component* in a
  directory is the signal to split it out, not to nest it; files that exist only to serve the one
  component — its stylesheet, hook, `formUtils.ts`, test, story — stay with it.
- **Don't add grouping directories.** No `subcomponents/`, no `camelCase` sub-areas. Name prefixes
  already group a domain: `Mileage*`, `Trip*`, `Vehicle*` sort together in any listing, and they do
  it without forcing a filing decision that a shared component can only get wrong.
- **Be consistent about singular and plural.** Singular names a surface over one record
  (`TripDrawer`, `TripForm`, `VehicleCard`), plural one over the collection (`TripsTable`,
  `TripsView`, `VehiclesGrid`). Parallel surfaces get parallel names — `TripsView`/`VehiclesView`.

Non-component helpers sit at the domain root, prefixed the same way — `tripUtils.ts` holds the
formatters `TripsTable` and `TripsMobileListItem` share.

Flat means shared components need no special handling: `MileageDeductionChart` is used by both
`MileageTrackingSummary` and `MileageTrackingStats`, and `VehicleSelector` by `TripForm` and
`TripsTableHeader`, without either being filed under one consumer. A type two layers need — like
`TripPurposeFilterValue` — belongs in `@schemas/*`, not exported from the component that renders it.

A component that is *not* domain-specific does not belong here at all — it goes to `@ui`
(primitive), `@blocks` (composed pattern), or `@components/utility` (rendering helper). "Which
domain owns this?" having no answer is the signal.

> **Migration in progress.** Domains are being moved into `features/` one PR at a time; directories
> still sitting directly under `src/components/` are un-migrated, not a second convention. Put new
> work in `features/<domain>/`, and if you touch an un-migrated domain, don't extend it in place —
> ask before mixing a move into a behavior change.

## File conventions

```
src/components/features/linkedAccounts/CustomAccountForm/
  CustomAccountForm.tsx          PascalCase component file
  customAccountForm.scss         camelCase stylesheet, imported by the .tsx
  CustomAccountForm.test.tsx     colocated test
  CustomAccountForm.stories.tsx  colocated story
```

Import with the **most specific path alias** available (`@ui/Button/Button`, not
`@components/ui/Button/Button`; `@features/mileage/Trips/Trips`, not
`@components/features/mileage/Trips/Trips`). Relative parent imports (`../`) are an ESLint error
outside the aliases. No barrel `index.ts` re-export files — import the module directly.

## Loading, error, and empty states

Do not hand-roll `isLoading ? … : isError ? … :` ladders. Use the utility components:

| Shape | Component |
| --- | --- |
| One data object with loading / error / inactive states | `ConditionalBlock` (`@components/utility/ConditionalBlock`) |
| An array with loading / error / empty states | `ConditionalList` (`@components/utility/ConditionalList`) |

Both take the data plus `Loading`/`Error`/`Empty`/`Inactive` nodes and a render-prop child.
Their prop types are unions: supplying `isLoading` obliges you to supply `Loading`, so TS
catches a half-handled state.

For the state nodes themselves use `DataState` / `DataStateContainer`
(`@ui/DataState/DataState`) and the skeleton loaders (`@ui/SkeletonLoader/*`,
`SkeletonTableLoader`) — not ad-hoc spinners or "No data" text.

## Responsive UX

Responsiveness is JS-driven off measured width, not CSS media queries alone. Size classes
come from `BREAKPOINTS` in `@utils/screenSizeBreakpoints` — mobile `< 500`, tablet `< 760`,
desktop above.

- To render **different components** per size, use `ResponsiveComponent`
  (`@components/utility/ResponsiveComponent`) with a `slots` record and a `resolveVariant`
  function. Avoid inline width ternaries scattered through JSX.
- To react to element size in logic, use `@hooks/utils/size/useElementSize` or
  `useElementViewSize`.
- Mobile-specific surfaces already exist (`@ui/MobilePanel`, `@ui/MobileList`,
  `@ui/MobileSelectionDrawer`); prefer them to reimplementing a drawer.

## Don't put state in an effect if you can avoid it

`useEffect` + `setState` is the most common source of extra render passes, stale values, and
flicker in this codebase. Work down this list and stop at the first option that fits:

1. **Derive it during render.** If a value is computable from props, state, or a query result, just
   compute it — don't mirror it into `useState`. Add `useMemo` only if the computation is genuinely
   expensive; a cheap expression needs neither state nor memo.
2. **Compute it in the event handler.** If the value changes in response to a user action, set it
   where that action happens rather than reacting to the change afterwards in an effect.
3. **Reset with a `key`.** To clear state when an entity changes, remount by passing a changing
   `key` instead of an effect that watches the id and resets each field.
4. **Only then use an effect** — and only for synchronizing with something outside React:
   subscriptions, timers, imperative DOM or third-party widgets, or a deliberate reset that a `key`
   can't express. Never call `setState` inline during render to achieve the same thing.

The tell is an effect whose dependency array holds only props or state and whose body is a single
`setState`. That's derived state, and it belongs in step 1.

`react-hooks/exhaustive-deps` is an error, so an effect written to "run only once" against changing
values will fight the linter. Treat that as the signal that the state doesn't belong in an effect.

## `slots` and `slotProps`

Two paired conventions, both keyed by **PascalCase slot name**. Never invent ad-hoc
`icon`/`renderIcon`/`titleSize` props when one of these fits.

**`slots`** injects *what to render* — a node or a component per named region:

```tsx
slots={{ Icon: CloudDownload }}                      // a component
slots={{ Heading: <Span weight='bold'>{title}</Span> }}  // a node
slots={{ EmptyState, ErrorState }}                   // several regions at once
```

A slot's type is whatever the region needs — `ReactNode` (`ExpandableCard.Heading`),
`React.FC` (`DataTable.EmptyState`, `DropdownMenu.Trigger`), or a function of state
(`Overlay.Trigger` receives `{ isOpen }`).

**`slotProps`** configures *how an internal element renders*, without exposing that element:

```tsx
<DataState slotProps={{ Title: { size: 'md', ellipsis: true } }} />
<Overlay slotProps={{ Popover: { placement: 'bottom' }, Dialog: { width: 320 } }} />
```

Three rules that follow:

- **Key names match the element, not the prop.** `Title`, `Popover`, `Dialog`, `Meter` — a reader
  should be able to find the element the entry configures.
- **Merge, don't replace, when re-exposing.** A wrapper forwarding `slotProps` spreads the
  caller's over its own defaults: `slotProps={{ Title: { size: 'md', ...slotProps?.Title } }}`
- **Memoize a computed `slots`/`slotProps` object**, since it's an object prop.

## Forms

Forms use TanStack Form through `useAppForm` (`@hooks/features/forms/useForm`) with the
pre-bound `Form*Field` components — never a raw input wired to `useState`. Split each form into a
hook that owns state and submission and a component that renders fields.

Full guide — field components, validators, the three error layers, submit wiring:
[`forms/SKILL.md`](forms/SKILL.md).

## Tables

Tables are `@tanstack/react-table` wrapped by blocks — pick the narrowest variant that fits
(`SimpleDataTable` is the default; then `PaginatedDataTable`, `ExpandableDataTable`,
`VirtualizedDataTable`, and `DataTable` for a hand-built instance).

The one rule that interacts with the rest of this file: **the table owns its loading, error, and
empty states** via `isLoading`/`isError` and `slots.EmptyState`/`slots.ErrorState` — don't wrap a
table in `ConditionalList`.

Variant trade-offs, the `BaseDataTableProps` contract, column config, and row behaviour:
[`blocks/DataTable/SKILL.md`](blocks/DataTable/SKILL.md).

## Accessibility

Interactive primitives are built on `react-aria-components`. Reuse them rather than adding
`onClick` to a `div`. Every icon-only button needs an `aria-label`, and that label is a
translated string.

## Public API

`src/index.tsx` is the published surface of `@layerfi/components`. A component is only
public once exported there, grouped under its existing section comment. Adding an export is
an API change — mention it in the PR. Anything not exported is internal and may be
refactored freely.

## Related

- [`src/components/ui/SKILL.md`](ui/SKILL.md) — primitives and their styling props
- [`src/styles/SKILL.md`](../styles/SKILL.md) — SCSS and BEM rules
- [`src/hooks/api/SKILL.md`](../hooks/api/SKILL.md) · [`src/providers/SKILL.md`](../providers/SKILL.md)
- [`src/assets/locales/SKILL.md`](../assets/locales/SKILL.md) — translated strings
- [`.storybook/SKILL.md`](../../.storybook/SKILL.md) — stories for new components
