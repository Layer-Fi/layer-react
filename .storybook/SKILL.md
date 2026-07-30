---
name: storybook
description: Story authoring and visual regression — gallery stories for primitives, one story per meaningful state for features, viewports over duplicates
applies_to: src/**/*.stories.tsx, .storybook/**
---

# Storybook and visual regression

```
npm run storybook          # dev server on :6006
npm run storybook:build
npm run chromatic          # needs CHROMATIC_PROJECT_TOKEN
```

Every story is a Chromatic snapshot on every PR (`.github/workflows/chromatic.yml`, with
TurboSnap so only affected stories re-snapshot). That makes story count a real cost.

## The one rule

**A new story is justified only by a visual state that cannot be composed into an existing
render.** Everything else is a gallery permutation, a viewport, or a control.

## Tier 1 — primitives (`src/components/ui/**`, `src/components/blocks/**`)

Pack variants into a *single* render:

- **`AllVariants` is normally the only export** — a gallery laying out every variant × size ×
  state in one grid. Don't add a `Default` playground story; put `args`/`argTypes` on the
  `meta` so controls still work against the gallery.
- Add a second story only for a state the gallery physically cannot show: an open overlay
  (`MenuOpen`, `DrawerOpen`, `Open`) or a distinct mobile rendering (`Mobile`).
- Drive the grid from the component's own exported unions (`ButtonVariant`, `ButtonSize`,
  `ButtonStatus`) so the matrix stays exhaustive as variants are added.
- Use `Gallery`, `Section`, `Matrix`, `Label` from `@test-utils/storybook/gallery`.
- Use `parameters: { chromatic: { disableSnapshot: true } }` for any story that adds no visual
  signal.
- Title primitives `'UI/…'` and blocks `'Blocks/…'`. `preview.tsx` keys off those prefixes to
  wrap bare components in `.Layer__component`, which is where the CSS variables live.

Reference: `src/components/ui/Button/Button.stories.tsx`.

## Tier 2 — features and views

One `Default` per feature, plus a separate story **only** when a state is visually distinct
**and** needs different args, MSW handlers, or interactions — empty, loading, error,
permission-gated. The `BankTransactions` `BookkeepingEnabled` / `BookkeepingDisabled` pair
(distinct MSW handlers) is the model. Don't add stories for arg permutations that Storybook
controls already cover.

## Cross-cutting dimensions → viewports, never duplicate stories

Size classes are configured once globally in `.storybook/preview.tsx`
(`parameters.chromatic.viewports`), sourced from `@utils/screenSizeBreakpoints`, so every
story is captured at mobile / tablet / desktop widths. Responsiveness is computed from
measured width in JS, so Chromatic resizes the capture iframe per width — a CSS-only viewport
wouldn't work.

Down-scope a story that gains nothing from three widths:
`parameters: { chromatic: { viewports: [1280] } }`.

Theme (light/dark) is intentionally deferred; when added it becomes a second dimension here
with no story changes.

## Data comes from MSW and fixtures

`preview.tsx` registers the full handler set and resets mock stores per story, and wraps
everything in `LayerTestProvider`. So:

- Never stub data with props when a mocked endpoint would do it.
- Use `parameters: { msw: { handlers: [...] } }` to override an endpoint for one story.
- Generated fixtures (`@fixtures/generated/*`) are the right source for list/table volume.
- Fixture dates are pinned to `FIXTURE_YEAR`, and `.storybook/mocks/systemDate` pins the
  clock, so snapshots don't drift over time.
- Shared story context helpers live in `src/test-utils` (`withProfitAndLossStoryContext`,
  `PinnedGlobalDateRange`, `*StoryControls`).

Constrain size and layout **in the component**, not in the story — a story that has to box a
component to look right is reporting a component bug.

## Flakiness

Two sources: the 250ms `setMinimumResponseDelay` in `preview.tsx` (loading-vs-loaded races)
and `motion` animations. Prefer stories that render a settled state. For stubborn cases add
`parameters: { chromatic: { delay: <ms> } }`, or disable animations in the Chromatic build
behind an `isChromatic()` guard.

## Related

- [`src/components/ui/SKILL.md`](../src/components/ui/SKILL.md) · [`src/msw/SKILL.md`](../src/msw/SKILL.md) · [`src/fixtures/SKILL.md`](../src/fixtures/SKILL.md)
