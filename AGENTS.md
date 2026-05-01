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
- For amounts, currency, and date formatting, see `docs/ai/formatting.md`
- For API and schema definitions, see `docs/ai/schemas.md`
- Stabilize code as follows:
  - **`useCallback`**: Only for functions passed as props to `memo()`-wrapped children or used in Hook dependency arrays. Not needed for handlers on plain HTML elements.
  - **`useMemo`**: Only when (a) the computation is expensive (>1ms), (b) the result is an object/array prop to a `memo()`-wrapped child, or (c) the result is used in a Hook dependency array. Never memoize primitives.

# Components

- Use `Span` from `@ui/Typography/Text` instead of `<span>`
- Use `<HStack>` and `<VStack>` from `@ui/Stack/Stack` instead of `<div>`
- Build on existing components in `@ui` before creating new ones

# Style

- Do not use inline styles
- Create `.scss` file matching component name but with lowercase first letter and import directly
- Use design system spacing scale
- For css class names, use BEM in PascalCase

# Abstractions

- Render single data object with loading/error/inactive states: `ConditionalBlock`
- Render array with loading/error/empty states: `ConditionalList`
- Render different components based on page width / mobile: `ResponsiveContainer`

# Documentation

- **State Management:** `docs/ai/state-management.md`
- **API:** `docs/ai/api.md`
