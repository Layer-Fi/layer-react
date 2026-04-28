# Agent Instructions

- For all code changes: KISS, YAGNI, DRY
- Generate designs and code in reviewable phases
- Do not add comments when writing code
- Pause and ask for guidance when: task scope is unclear, complications arise, or phase completion

# Code Convention

- Before creating a new definition, ensure no similar implementation already exists in the repo. If so, expand the existing implementation instead
- Always use the most specific path alias from `tsconfig.json` for imports
- Use components located in `src/components/ui`. Import with `@ui` alias
- Place new, reusable components in `src/components/ui`
- Stabilize code as follows:
  - **`useCallback`**: Only for functions passed as props to `memo()`-wrapped children or used in Hook dependency arrays. Not needed for handlers on plain HTML elements.
  - **`useMemo`**: Only when (a) the computation is expensive (>1ms), (b) the result is an object/array prop to a `memo()`-wrapped child, or (c) the result is used in a Hook dependency array. Never memoize primitives.

# CSS Styles

- Do not use the `style` prop or write raw utility/atomic class strings in `className`
- Do not re-state styles the target component or its parent stack already set
- Use the following spacing scale: (`4xs|3xs|2xs|xs|sm|md|lg|xl|2xl|3xl|5xl`)

## CSS Selectors

- DRY: Use existing design-system props instead of new SCSS selectors when possible
- `ComponentName.tsx` should add CSS selectors useing `import './componentName.scss'` (camelCase)
- For any styling that component props can't express, create a new CSS class following name guidelines below
- Nest selectors that share a block prefix under one `&__` root; do not nest more than one level (excluding pseudo-classes, pseudo-elements, and media queries): `.Layer__<ComponentName> { &__Element { … } }`
- Only use descendant combinator selectors when the element can't own a class.

### CSS Selector Naming
- Follow BEM style: `Layer__Block__Element--modifier`
  - `Block` and `Element` are in PascalCase
  - `Layer__` is a namespace

# Components

- Use `Span` from `@ui/Typography/Text` instead of `<span>`
- Use `<HStack>` and `<VStack>` from `@ui/Stack/Stack` instead of `<div>`
- Build on existing components in `@ui` before creating new ones 

# Abstractions

- Render single data object with loading/error/inactive states: `ConditionalBlock`
- Render array with loading/error/empty states: `ConditionalList`
- Render different components based on page width / mobile: `ResponsiveContainer`

# Documentation

- **State Management:** `docs/ai/state-management.md`
- **API:** `docs/ai/api.md`
