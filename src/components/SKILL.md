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
| **Blocks** | `src/components/blocks/**` | `@blocks/*` | composed patterns (`DataTable`, `SummaryCard`, `Wizard`, `ActionableList`, the `Form*Field` set) — still domain-agnostic |
| **Features** | `src/components/features/<domain>/**` | `@features/*` | one domain; fetches its own data via hooks |
| **Views** | `src/views/**` | `@views/*` | full pages composing features and mounting providers |
| **Utilities** | `src/components/utility/**` | `@components/utility/*` | rendering helpers, not UI |

Dependencies point one way only: views → features → blocks → ui. A `@ui` component must
never import a schema, a hook that fetches, or a feature component.

**Before creating anything, search for an existing implementation and extend it instead.**
Build on `@ui` and `@blocks` before writing a new component; a new reusable primitive
belongs in `src/components/ui`, not next to the feature that first needed it.

## Finding and placing feature code

`src/components/features/` holds one directory per **domain object**, using the same camelCase name
as `src/hooks/features/*` and `src/schemas/*` — mileage is `@features/mileage`,
`@hooks/features/mileage`, `@schemas/mileage`. Reuse an existing domain name rather than inventing a
near-synonym.

Inside a domain the layout is flat, so **a component's path is its name**:
`@features/mileage/TripDrawer/TripDrawer`, always `<domain>/<Name>/<Name>.tsx`.

- **Every reusable component gets a directory**, even a one-file one. Its stylesheet, hook, utils,
  test, and story sit beside it. Only a domain-wide helper moves out, into the domain's one
  `utils.ts` or `constants.ts` at the root.
- **A part only its parent could ever render nests inside the parent** —
  `TripsMobileList/TripsMobileListItem.tsx`,
  `MileageDeductionChart/MileageDeductionChartTooltip.tsx`. A nested part is private: if a second
  component comes to need it, move it out to the domain root rather than importing it from inside.
  The test is whether another component *could* render it, not how many do today.
- **Singular for one record, plural for the collection** — `TripDrawer`/`TripForm` against
  `TripsTable`/`TripsView`.

A component that is *not* domain-specific belongs in `@ui` (primitive), `@blocks` (composed
pattern), or `@components/utility` (rendering helper).

> `src/components/` holds only `blocks`, `features`, `ui`, and `utility`. Nothing else
> belongs at that level — a new component goes in one of those, never beside them.

## File conventions

```
src/components/features/customAccounts/CustomAccountForm/
  CustomAccountForm.tsx          PascalCase component file
  customAccountForm.scss         camelCase stylesheet, imported by the .tsx
  CustomAccountForm.test.tsx     colocated test
  useCustomAccountForm.ts        the hook that owns its state
```

Import with the **most specific alias** (`@ui/Button/Button`, not `@components/ui/Button/Button`).
Relative parent imports (`../`) are an ESLint error outside the aliases, and there are no barrel
`index.ts` files.

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
(`@ui/DataState/DataState`) and the skeleton loaders (`@ui/SkeletonLoader/*`) — not
ad-hoc spinners or "No data" text.

## Responsive UX

Responsiveness is JS-driven off measured width, not CSS media queries alone. Size classes
come from `BREAKPOINTS` in `@utils/shared/size/screenSizeBreakpoints` — mobile `< 500`, tablet `< 760`,
desktop above.

- To render **different components** per size, use `ResponsiveComponent`
  (`@components/utility/ResponsiveComponent`) with a `slots` record and a `resolveVariant`
  function. Avoid inline width ternaries scattered through JSX.
- To react to element size in logic, use `@hooks/utils/size/useElementSize` or
  `useElementViewSize`.
- Mobile-specific surfaces already exist (`@blocks/MobileList`,
  `@blocks/MobileSelectionDrawer`); prefer them to reimplementing a drawer.

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

Forms use TanStack Form through `useAppForm` (`@blocks/Form/useForm`) with the
pre-bound `Form*Field` components — never a raw input wired to `useState`. Split each form into a
hook that owns state and submission and a component that renders fields.

Full guide — field components, validators, the three error layers, submit wiring:
[`blocks/Form/SKILL.md`](blocks/Form/SKILL.md).

## Tables

Tables are `@tanstack/react-table` wrapped by blocks — pick the narrowest variant that fits
(`SimpleDataTable` is the default; then `PaginatedDataTable`, `ExpandableDataTable`,
`VirtualizedDataTable`, and `DataTable` for a hand-built instance).

The one rule that interacts with the rest of this file: **the table owns its loading, error, and
empty states** via `isLoading`/`isError` and `slots.EmptyState`/`slots.ErrorState` — don't wrap a
table in `ConditionalList`.

Variant trade-offs, the `BaseDataTableProps` contract, column config, and row behaviour:
[`blocks/Table/SKILL.md`](blocks/Table/SKILL.md).

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
