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
| **Features** | `src/components/<Feature>/**` | `@components/*` | one domain; fetches its own data via hooks |
| **Views** | `src/views/**` | `@views/*` | full pages composing features and mounting providers |
| **Utilities** | `src/components/utility/**` | `@components/utility/*` | rendering helpers, not UI |

Dependencies point one way only: views → features → blocks → ui. A `@ui` component must
never import a schema, a hook that fetches, or a feature component.

**Before creating anything, search for an existing implementation and extend it instead.**
Build on `@ui` and `@blocks` before writing a new component; a new reusable primitive
belongs in `src/components/ui`, not next to the feature that first needed it.

## File conventions

```
src/components/CustomAccountForm/
  CustomAccountForm.tsx          PascalCase component file
  customAccountForm.scss         camelCase stylesheet, imported by the .tsx
  CustomAccountForm.test.tsx     colocated test
  CustomAccountForm.stories.tsx  colocated story
```

Import with the **most specific path alias** available (`@ui/Button/Button`, not
`@components/ui/Button/Button`). Relative parent imports (`../`) are an ESLint error
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

## Props conventions

- Injectable content goes through a **`slots` prop** (`slots={{ Icon }}`), not ad-hoc
  `icon`/`renderIcon` props.
- Group a component's style/variant props into an exported `*StyleProps` type when the
  component is a primitive, so wrappers can re-expose them (see `ButtonStyleProps`).
- Hooks and components taking two or more parameters take a single options object.
- Don't build `somethingProps` objects out of ternaries and spread them; branch in JSX.
- Size and layout bounds belong in the component, not in the story or the consumer.
- Keep `Button` JSX on one line when it fits under ~80 characters.

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
- [`src/hooks/SKILL.md`](../hooks/SKILL.md) · [`src/providers/SKILL.md`](../providers/SKILL.md)
- [`src/assets/locales/SKILL.md`](../assets/locales/SKILL.md) — translated strings
- [`.storybook/SKILL.md`](../../.storybook/SKILL.md) — stories for new components
