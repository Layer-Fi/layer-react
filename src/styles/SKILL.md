---
name: styling
description: SCSS conventions — no inline styles, CSS variables, Layer__ BEM naming, flat selectors with nesting only for modifiers, stylelint property order
applies_to: src/**/*.scss, src/styles/**
---

# Styling

## Hard rules

- **No `style` prop, no inline styles.** (Storybook gallery scaffolding in
  `@testUtils/storybook/layout/gallery` is the one sanctioned exception.)
- **No utility/atomic class strings** in `className`, and **never build a class name by
  concatenation**.
- **Do not re-state styles** the target component or an ancestor stack already sets.
- **Reach for props first.** If `Stack`/`Span` props can express it, no CSS is needed. A
  class holding ≤2 typography properties should be a `Span` prop instead.
- **Only use variables** from `src/styles/variables.scss` for colors, spacing, radii,
  typography — never a raw hex, `px` font size, or magic spacing value.

## Stylesheet layout

| File | Role |
| --- | --- |
| `variables.scss` | the public design tokens, declared on the `.Layer__component` / `.Layer__Portal` / `.Layer__view` / … root selectors |
| `internal_variables.scss` | tokens not part of the consumer-facing surface |
| `global.scss`, `component.scss`, `loader.scss`, `charts.scss` | resets and base rules |
| `index.scss` | the entry point bundled to `dist/index.css` |

Because tokens are declared on those root classes, anything rendered outside the tree (a
portal, a bare primitive in a story) needs one of those classes on an ancestor or the
variables resolve to nothing. Theme colors derive from `--color-dark-*`/`--color-light-*`
HSL parts, which consumers override — never hardcode a value a theme should control.
`--bg-brand-primary`, `--fg-brand-primary`, `--bg-brand-accent`, `--fg-brand-accent` are
intentionally undefined; the library ships no default.

## Colocation

`ComponentName.tsx` imports its own `componentName.scss` (PascalCase component, camelCase
stylesheet) as a side-effect import: `import './componentName.scss'`. The style import goes
**last** in the import block — no TS/JS imports may follow a CSS import.

## Selector naming — `Layer__Block__Element--modifier`

- `Layer__` is the namespace, present on every class.
- `Block` and `Element` are PascalCase; `modifier` is camelCase.
- Primitives use a `Layer__UI__` prefix (`Layer__UI__Button`, `Layer__UI__Table-Cell`).
- Blocks are at least two PascalCase words.

## Nesting — only for modifiers

**Write each block and element as its own flat, top-level selector.** Don't nest elements
under their block: the full class name should be greppable, and `&__`-built names are not.

Nesting is for **modifiers of the selector you're already in** — attribute selectors,
pseudo-classes, pseudo-elements, and media queries:

```scss
.Layer__MyComponent { … }

.Layer__MyComponent__Header { … }

.Layer__MyComponent__Row {
  &[data-selected] { … }

  &:hover { … }
}
```

Not this:

```scss
.Layer__MyComponent {
  &__Header { … }      /* the name `Layer__MyComponent__Header` appears nowhere in the file */

  &__Row {
    &[data-selected] { … }
  }
}
```

Use a descendant combinator only when the element genuinely can't own a class (third-party
markup). Prefer `data-*` attribute selectors to `--modifier` classes for variants — see
[`../components/ui/SKILL.md`](../components/ui/SKILL.md).

## Formatting (enforced by stylelint)

`npm run lint:stylelint` / `lint:fix`. Notable rules:

- **Property order is enforced** by `order/properties-order`: `all` → `box-sizing` →
  positioning → display → flex → grid → gap → alignment → justify → overflow → sizing →
  padding → border-radius → border → effects → margin → background → cursor → typography.
  Write declarations in that order.
- Blank line before each declaration group and each custom property (except first-nested).
- Custom property names are `^[a-z0-9-]+$`.
- 2-space indent, single quotes, max 160 chars, no trailing whitespace, newline at EOF,
  zero lengths unitless (`0`, not `0px`).
- Prefer logical properties (`padding-inline`, `block-size`, `inline-size`) — the design
  system is written in logical terms.
- `*.scss` is auto-fixed on commit via lint-staged.

## Related

- [`../components/ui/SKILL.md`](../components/ui/SKILL.md) — style props and `toDataProperties`
- [`../components/SKILL.md`](../components/SKILL.md) — component/stylesheet file conventions
