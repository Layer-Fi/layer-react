# Agent Instructions

- For significant changes, provide implementation options with a recommended approach before coding
- Pause and ask for guidance when: task scope is unclear, complications arise, or phase completion
- If user provides information broadly relevant to codebase, ask if it should be added to relevant docs
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
- Avoid unnecessary CSS classes. Use existing props when possible
- Use design system spacing scale
- Create `.scss` file matching component name but with lowercase first letter and import directly

# Documentation

- **Styling:** `docs/ai/styling.md`
- **State Management:** `docs/ai/state-management.md`
- **API Layer:** `docs/ai/api-layer.md`
