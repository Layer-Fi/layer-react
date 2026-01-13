# Agent Instructions

- For significant changes, provide implementation options with a recommended approach before coding
- Pause and ask for guidance when: task scope is unclear, complications arise, or phase completion
- If user provides information broadly relevant to codebase, ask if it should be added to relevant docs
- Do not add comments when writing code
- Generate designs and code in reviewable phases
- For all code changes: KISS, YAGNI, DRY
- - **Refer to documentation files below when relevant to current task**

# Codebase Conventions

- Fix lint errors: `npx lint-staged`
- Before completing work: run `npm run typecheck` and fix issues

# Components

- Use `Span` from `../ui/Typography/Text` instead of `<span>`
- Use `<HStack>` and `<VStack>` from `../ui/Stack/Stack` instead of `<div>`
- Build on existing components in `../ui` before creating new ones

# Style

- No inline styles. Use existing component props
- Use existing props when available instead of creating a new css class
- Use design system spacing scale
- Create `.scss` file matching component name but with lowercase first letter and import directly
- Use BEM naming for css classes

# Abstractions

- Render single data object with loading/error/inactive states: `ConditionalBlock`
- Render array with loading/error/empty states: `ConditionalList`
- Render different components based on page width / mobile: `ResponsiveContainer`

# Documentation

- **Styling:** `docs/ai/styling.md`
- **State Management:** `docs/ai/state-management.md`
- **API Layer:** `docs/ai/api-layer.md`
