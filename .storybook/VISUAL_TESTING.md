# Visual regression testing

Visual diffs run on Chromatic against our Storybook build. Every story is a snapshot;
Chromatic flags pixel changes on each PR. To keep coverage high without drowning in
snapshots, follow the convention below.

## The one rule

**A new story is justified only by a visual state that cannot be composed into an
existing render.** Everything else is a gallery permutation or a viewport/mode — not a
new story.

## Tier 1 — base UI primitives (`src/components/ui/*`): gallery stories

Chromatic snapshots once per story, so pack variants into a *single* render instead of
one story per variant.

- Give each primitive a `Default` playground story (for Storybook controls) and an
  `AllVariants` gallery that lays out every variant × size × state in one grid.
- Drive the grid from the component's own exported unions (e.g. `ButtonVariant`,
  `ButtonSize`, `ButtonStatus`) so the matrix stays exhaustive as variants are added.
- Add `parameters: { chromatic: { disableSnapshot: true } }` to playground/control-only
  stories that add no visual signal — snapshot the gallery, not the playground.

See `src/components/ui/Button/Button.stories.tsx` for the reference implementation.

## Tier 2 — features / views: one story per meaningful state

Keep the existing pattern: a `Default` per feature, plus a separate story **only** when a
state is visually distinct **and** needs different args/mocks/interactions — empty,
loading, error, permission-gated. The `BankTransactions` `BookkeepingEnabled` /
`BookkeepingDisabled` pair (distinct MSW handlers) is the model. Do not add a story for
arg permutations that Storybook controls already cover.

## Cross-cutting dimensions → viewports/modes, never duplicate stories

Size classes are configured once globally in `.storybook/preview.tsx`
(`parameters.chromatic.viewports`), sourced from `src/utils/screenSizeBreakpoints.ts`, so
every story is captured at mobile / tablet / desktop widths. Because responsiveness is
computed from `window.innerWidth` (`useSizeClass`), Chromatic resizes the capture iframe
per width — a CSS-only viewport would not work.

Down-scope an individual story that gains nothing from three widths with a per-story
override: `parameters: { chromatic: { viewports: [1280] } }`.

Theme (light/dark) is intentionally deferred; when added it becomes a second dimension
here with no story changes.

## Flakiness

Sources: the 250ms `setMinimumResponseDelay` in `preview.tsx` (loading-vs-loaded races)
and `motion` animations. Prefer stories that render a settled state. For stubborn cases,
add `parameters: { chromatic: { delay: <ms> } }`, or disable animations in the Chromatic
build behind an `isChromatic()` guard.

## Running locally

```
npm run chromatic   # requires CHROMATIC_PROJECT_TOKEN
```

CI runs Chromatic on every PR (`.github/workflows/chromatic.yml`) with TurboSnap, so only
stories affected by a change are re-snapshotted.
