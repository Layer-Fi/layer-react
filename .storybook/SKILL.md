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

Chromatic snapshots the design system only — `src/components/ui/**`, `src/components/blocks/**`,
and `*scratch.stories.tsx` (`onlyStoryFiles` in `.github/workflows/chromatic.yml`, plus
TurboSnap so only affected stories re-snapshot). Feature and view stories compose those
primitives, so a regression usually surfaces in the primitive's snapshot at a fraction of the
cost. Story count in `ui/` and `blocks/` is therefore still a real cost; elsewhere it is not.

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
- Use `Gallery`, `Section`, `Matrix`, `Label` from `@testUtils/storybook/layout/<Component>` — one module each.
- Use `parameters: { chromatic: { disableSnapshot: true } }` for any story that adds no visual
  signal.

Reference: `src/components/ui/Button/Button.stories.tsx`.

## Tier 2 — features and views

One `Default` per feature, plus a separate story **only** when a state is visually distinct
**and** needs different args, MSW handlers, or interactions — empty, loading, error,
permission-gated. The `BankTransactions` `BookkeepingEnabled` / `BookkeepingDisabled` pair
(distinct MSW handlers) is the model. Don't add stories for arg permutations that Storybook
controls already cover.

## Cross-cutting dimensions → viewports, never duplicate stories

Size classes are configured once globally in `.storybook/preview.tsx`
(`parameters.chromatic.viewports`), sourced from `@utils/shared/size/screenSizeBreakpoints`, so every
story is captured at mobile / tablet / desktop widths. Responsiveness is computed from
measured width in JS, so Chromatic resizes the capture iframe per width — a CSS-only viewport
wouldn't work.

Down-scope a story that gains nothing from three widths:
`parameters: { chromatic: { viewports: [1280] } }`.

## Data comes from MSW and fixtures

`preview.tsx` registers the full handler set and resets mock stores per story, and wraps
everything in `LayerTestProvider`. So:

- Never stub data with props when a mocked endpoint would do it.
- Use `parameters: { msw: { handlers: [...] } }` to override an endpoint for one story.
- Generated fixtures (`@fixtures/generated/*`) are the right source for list/table volume.
- Fixture dates are pinned to `FIXTURE_YEAR`, and `.storybook/mocks/systemDate` pins the
  clock, so snapshots don't drift over time.
- Shared story helpers live under `@testUtils/storybook` — `decorators/` (story context wrapping),
  `controls/` (argTypes builders), `data/` (rows and column configs shared by several stories),
  `interactions/` (play-function queries). Data only one story file uses goes next to that story
  as `<Component>.storyData.tsx`.

Constrain size and layout **in the component**, not in the story — a story that has to box a
component to look right is reporting a component bug.

## Some stories are load-bearing for the public docs

`scripts/docs-screenshots.manifest.ts` maps story ids to images in
`Layer-Fi/api-documentation`; every stable release recaptures them and opens a docs PR
(`.github/workflows/docs-screenshots.yml`). Renaming or deleting one of those stories fails
`npm run screenshots:check` on the PR — update the manifest in the same change.

Every one of them also carries `tags: ['docs-screenshot']`, which surfaces the set under
Storybook's sidebar tag filter. A CSF file has a single `title`, so a story can't also live in
a `Docs/` folder without becoming a second story (and a second Chromatic snapshot) — the tag
is the filterable stand-in. `screenshots:check` enforces tag ↔ manifest parity both ways.

## `public-api` — what ships to GitHub Pages

A separate, broader tag, opted into on **each individual story** that should ship — never on
the meta. `STORYBOOK_SCOPE=public` filters the build to those stories
(`experimental_indexers` in `main.ts`), and `storybook-pages.yml` sets it, so the public deploy
shows the shipped API and nothing else. Opt-in per story is fail-closed: a new story on a
public component stays private until someone tags it.

The two tags are independent — `public-api` is the whole exported surface, `docs-screenshot`
the narrower set backing images on docs.layerfi.com. Most public stories carry only the first;
a docs-only story carries only the second and simply omits `public-api`. Export a new component
from `index.tsx` and each story of it you want on GitHub Pages needs `tags: ['public-api']`.

A story that exists only to back a docs image still belongs next to its component, as the
overlay-state exception above (`DrawerOpen`, `Creation`, `ConfirmingAccounts`). Drive
it with a `play` function, and make the play *assert* the state it set up — the table can
re-render as data lands and detach the node you just clicked.

## `real-backend` — what ships to the Vercel preview

Also opted into per story, and fail-closed for the same reason. Add it when the story renders a
state a real backend produces on its own. Two disqualifiers: **story-level
`parameters.msw.handlers`**, which exists to force a state the backend won't reproduce (meta-level
handlers are fine — they give way to real data), and **a `play` function**, which clicks a row real
data may not have. `STORYBOOK_SCOPE=real` filters to it.

## Flakiness

Two sources: the 250ms `setMinimumResponseDelay` in `preview.tsx` (loading-vs-loaded races)
and `motion` animations. Prefer stories that render a settled state. For stubborn cases add
`parameters: { chromatic: { delay: <ms> } }`, or disable animations in the Chromatic build
behind an `isChromatic()` guard.

## Related

- [`src/components/ui/SKILL.md`](../src/components/ui/SKILL.md) · [`src/msw/SKILL.md`](../src/msw/SKILL.md) · [`src/fixtures/SKILL.md`](../src/fixtures/SKILL.md)
