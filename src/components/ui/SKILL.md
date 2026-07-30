---
name: design-system
description: UI primitives — no raw divs/spans, style props over CSS, data-attribute variants via toDataProperties, react-aria basis, gallery stories
applies_to: src/components/ui/**, src/components/blocks/**
---

# Design system primitives

`src/components/ui/**` (alias `@ui/*`) is the design system. It is domain-agnostic: no
schemas, no fetching hooks, no feature imports. `src/components/blocks/**` (`@blocks/*`)
composes primitives into reusable patterns and is likewise domain-agnostic.

## Never write a raw layout or text element

| Instead of | Use |
| --- | --- |
| `<div>` for layout | `<HStack>` / `<VStack>` from `@ui/Stack/Stack` (`Stack`, `Spacer` also exported) |
| `<span>` | `<Span>` from `@ui/Typography/Text` |
| `<p>`, `<label>`, `<header>` | `P`, `Label`, `Header` from `@ui/Typography/Text` |
| `<h1>`…`<h6>` | `Heading` from `@ui/Typography/Heading` |
| a formatted money string | `<MoneySpan>` from `@ui/Typography/MoneySpan` |
| a formatted duration | `<DurationSpan>` from `@ui/Typography/DurationSpan` |
| `<button>` / `<a>` | `Button`, `LinkButton`, `SubmitButton`, `CloseButton`, `BackButton`, `Link` |

Layout `div` wrappers are flagged in review, and the legacy `Text`/`TextSize`/`TextWeight`
exports from `@components/Typography/Text` are deprecated — use `P`, `Span`, `Label`, or
`Header` from `@ui/Typography/Text` and the `Span` props (`size`, `weight`, `withTooltip`)
instead.

## Style props before CSS

`Stack` and the typography components already express most layout and text styling as
props. Reach for a new SCSS class only when no prop can express it.

- `Stack`: `align`, `justify`, `gap`, `overflow`, `fluid`, and logical padding
  `pb`/`pbs`/`pbe`/`pi`/`pis`/`pie`.
- Text: `size` (`2xs`–`xl`), `weight`, `variant` (`placeholder`/`subtle`/`inherit`/`white`),
  `status` (`error`/`success`/`warning`/`disabled`/`info`), `align`, `ellipsis`, `noWrap`,
  `numeric='tabular-nums'`, `textCase`, `invert`, plus the same padding props.
- Spacing values come from the shared `Spacing` union in `@ui/sharedUITypes`
  (`4xs`…`5xl`) — never a raw `rem` value in a prop.

A CSS class holding two or fewer typography properties is a `Span` prop, not a class.

## Variants are data attributes, not class modifiers

Primitives render a single stable class name and express every variant as a `data-*`
attribute produced by `toDataProperties` (`@utils/styleUtils/toDataProperties`), which
drops `undefined`/`false` and only emits `string | number | true`:

```tsx
const dataProperties = toDataProperties({ size, variant, status, 'full-width': fullWidth })

return <ReactAriaButton {...restProps} {...dataProperties} className={BUTTON_CLASS_NAMES.DEFAULT} />
```

```scss
.Layer__UI__Button {
  &[data-variant='ghost'] { … }
  &[data-icon] { … }
}
```

camelCase props map to kebab-case keys (`fullWidth` → `'full-width'`). Never build a class
name by string concatenation.

## Build on react-aria-components

Interactive primitives wrap `react-aria-components` (imported by deep path, e.g.
`react-aria-components/Button`) so focus management, keyboard behaviour, and ARIA come for
free — along with `data-focus-visible`, `data-disabled`, `data-pending` hooks for styling.
`forwardRef` everything; merge refs with `react-merge-refs`. When children can be a render
prop, pass them through `withRenderProp` (`@components/utility/withRenderProp`).

## Strings and formatting inside primitives

Even primitives translate: `Button` calls `t('common:state.loading', 'Loading…')` for its
pending state. Any user-visible string, including `aria-label`, goes through `t()`.
Formatting goes through `useIntlFormatter` — see
[`src/utils/i18n/SKILL.md`](../../utils/i18n/SKILL.md).

## Stories for primitives

A primitive gets one `AllVariants` gallery story rendering the full variant × size × state
matrix in a single snapshot, driven from the component's own exported unions so it stays
exhaustive — plus a second story only for a state the gallery can't show (an open overlay, a
distinct mobile rendering). Controls go on the `meta`, not a separate playground story. Use
`Gallery`, `Section`, `Matrix`, and `Label` from `@test-utils/storybook/gallery`. Details in
[`.storybook/SKILL.md`](../../../.storybook/SKILL.md).

## Related

- [`src/styles/SKILL.md`](../../styles/SKILL.md) — SCSS structure, variables, BEM
- [`src/components/SKILL.md`](../SKILL.md) — the layering these primitives sit under
