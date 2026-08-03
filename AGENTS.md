# Agent Instructions

`@layerfi/components` — Layer's embeddable React accounting component library, published to
npm from `src/index.tsx`. Consumers nest our components under `LayerProvider` and brand them
with CSS variables, so **everything is themeable, localizable, and mountable more than once
on a page**. Most conventions below exist to protect one of those three properties.

## Working style

- Before creating a new definition, check whether a similar implementation already exists in
  the repo; extend it instead of adding a parallel one
- Generate designs and code in reviewable phases
- Do not add comments when writing code, beyond a short note on a genuinely non-obvious constraint
- Pause and ask for guidance when: task scope is unclear, complications arise, or a phase completes
- Never recreate a file that is missing from the tree without asking — deletions are intentional
- Verify with `npm run typecheck`, `npm run lint`, and `npm test -- --run` before handing work back
- Do not run `npm install` / `npm i` — ask first; dependency changes belong in their own PR
- PRs follow [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md): Description, Changes, Blockers, How this has been tested

## Where to read before you write

Each area has a colocated `SKILL.md`. **Read the relevant one(s) before making changes there.**

| Working on… | Read |
| --- | --- |
| API contracts, Effect `Schema`, enums, nullability, envelopes, money types | [`src/schemas/SKILL.md`](src/schemas/SKILL.md) |
| Fetching, mutating, caching — SWR hook factories, cache tags, invalidation | [`src/hooks/api/SKILL.md`](src/hooks/api/SKILL.md) |
| Feature/util hooks — which directory, composition and return conventions | [`src/hooks/SKILL.md`](src/hooks/SKILL.md) |
| Zustand stores, contexts, providers, feature visibility | [`src/providers/SKILL.md`](src/providers/SKILL.md) |
| Component structure, loading/empty states, responsive UX | [`src/components/SKILL.md`](src/components/SKILL.md) |
| Design-system primitives, style props, variant data attributes | [`src/components/ui/SKILL.md`](src/components/ui/SKILL.md) |
| Building a form — fields, validators, submit and error handling | [`src/components/blocks/Form/SKILL.md`](src/components/blocks/Form/SKILL.md) |
| Building a data table — variant choice, columns, row behaviour | [`src/components/blocks/DataTable/SKILL.md`](src/components/blocks/DataTable/SKILL.md) |
| SCSS, CSS variables, BEM naming, property order | [`src/styles/SKILL.md`](src/styles/SKILL.md) |
| Translated strings, plurals, the Crowdin pipeline | [`src/assets/locales/SKILL.md`](src/assets/locales/SKILL.md) |
| Formatting money, numbers, percentages, dates, durations | [`src/utils/i18n/SKILL.md`](src/utils/i18n/SKILL.md) |
| Mocking endpoints — MSW handlers, stateful stores | [`src/msw/SKILL.md`](src/msw/SKILL.md) |
| Fixture data — handwritten factories vs generated rows | [`src/fixtures/SKILL.md`](src/fixtures/SKILL.md) |
| Writing tests | [`src/test-utils/SKILL.md`](src/test-utils/SKILL.md) |
| Stories and visual regression | [`.storybook/SKILL.md`](.storybook/SKILL.md) |

Those skills plus this file are the only convention docs — each is the single source of truth
for its area, so update the relevant one when a convention changes rather than describing it
somewhere new. Cross-cutting rules (TypeScript, imports, lint, commands, CI) live here, because
they belong to no single directory. The remaining root docs are not agent instructions:
[`README.md`](README.md) is consumer-facing usage and [`PUBLISHING.md`](PUBLISHING.md) is the
release process.

## Repo map

| Path | Alias | Contains |
| --- | --- | --- |
| `src/schemas` | `@schemas/*` | Effect schemas — the source of truth for every API contract |
| `src/types` | `@internal-types/*` | internal-only types (no wire format) + `utility/` type helpers |
| `src/utils` | `@utils/*` | pure helpers: `api`, `swr`, `i18n`, `date`, `form`, `zustand`, `styleUtils` |
| `src/hooks/api/**` | `@api/*` | one file per endpoint in a tree mirroring the REST path, named for the HTTP method (`get.ts`, `post.ts`, …) |
| `src/hooks/{features,utils,legacy}` | `@hooks/*` | composed feature logic · generic hooks · pre-factory hooks (don't extend) |
| `src/providers`, `src/contexts` | `@providers/*`, `@contexts/*` | scoped Zustand stores and DI contexts |
| `src/components/ui` | `@ui/*` | design-system primitives (domain-agnostic) |
| `src/components/blocks` | `@blocks/*` | composed patterns: tables, cards, wizards (domain-agnostic) |
| `src/components/features/<domain>` | `@features/*` | feature UI, one directory per domain object; fetches its own data |
| `src/components/utility` | `@components/utility/*` | rendering helpers: `ConditionalBlock`, `ResponsiveComponent`, `withRenderProp` |
| `src/views` | `@views/*` | full-page compositions that mount providers |
| `src/styles` | — | design tokens and base CSS, bundled to `dist/index.css` |
| `src/msw` | `@msw/*` | mock API, mirroring the same route tree as `hooks/api` |
| `src/fixtures` | `@fixtures/*` | fixture factories, generators, and committed `generated/*.gen.ts` |
| `src/test-utils` | `@test-utils/*` | `LayerTestProvider`, form fillers, fixed dates, story helpers |

Dependencies point one way: views → features → blocks → ui. A `@ui` component never imports a
schema, a fetching hook, or a feature.

`features/<domain>` reuses the domain names of `src/hooks/features/*` and `src/schemas/*`, so one
name locates a domain's components, hooks, and contracts. Domains are being migrated into
`features/` one PR at a time — directories still directly under `src/components/` are un-migrated,
not a second convention.

## Non-negotiables

- **Imports:** always the most specific alias. No relative parent imports (`../`), no barrel
  `index.ts` files, style imports last. Import order is lint-enforced — run `lint:fix`, don't
  sort by hand. Details under [TypeScript and imports](#typescript-and-imports) below.
- **Components:** build on `@ui` before creating anything new; new reusable primitives go in
  `src/components/ui`. `<HStack>`/`<VStack>` instead of `<div>`, `<Span>`/`<P>`/`<Label>`
  instead of raw text elements.
- **Styling:** no `style` prop, no inline styles, no utility class strings, no concatenated
  class names. Colors and spacing come from `src/styles/variables.scss`. Prefer component
  props over new CSS; express variants as `data-*` attributes via `toDataProperties`. Write
  flat, greppable selectors — nest only modifiers of the current selector, never `&__Element`.
- **Strings:** every user-visible string — including `aria-label`, table headers, and empty
  states — goes through `t('ns:category.key', 'Default')` with an inline default. Never
  hand-edit `src/assets/locales/**`; it's generated from code and Crowdin.
- **Formatting:** never format money, numbers, percentages, or dates by hand. Use
  `useIntlFormatter()` / `<MoneySpan>`. Currency inputs are **cents**; percent inputs are
  **fractions**; dates take a `DateFormat` enum value, never a format string.
- **Data:** no `useSWR` or `fetch` in feature code — use the factories in `@hooks/utils/swr`.
  `businessId` and auth are injected; never pass them from a component. When consuming a new
  backend response, **stop and ask for the API contract** rather than guessing the schema.
- **State:** SWR owns server state, Zustand owns UI state, Context is for DI. Never mirror
  server data into a store. Never call `setState` during render, and avoid `useEffect` and
  `setState` for values you can derive — see [`src/components/SKILL.md`](src/components/SKILL.md).
- **Stabilize deliberately:** `useCallback` only for props to `memo()`ed children or hook
  dependency arrays; `useMemo` only for expensive computations, object/array props to
  `memo()`ed children, or dependency-array values. Never memoize primitives. Do memoize object
  literals returned from custom hooks.

## Things to avoid

Each of these has broken something before:

- **Unmocked requests fail.** Vitest and Storybook both error on unhandled `layerfi.com`
  calls. A new endpoint needs an MSW handler **registered in the enclosing `handlers.ts`**.
- **`Schema.NullishOr` is the default** for optional/nullable API fields — the backend omits a
  field on one endpoint and returns `null` on another.
- **Never hand-write snake_case JSON.** Mocks hold decoded fixtures and encode through the
  schema, so wire-format changes propagate automatically.
- **Committed fixtures go stale.** Touching a fixture schema or generator means
  `npm run fixtures:generate` and committing the `.gen.ts` output; CI checks it.
- **Raw `BigDecimal` in form or React state triggers TS2589.** Use `NonRecursiveBigDecimal`.
- **CSS variables only exist under the design-system root classes** (`.Layer__component`,
  `.Layer__Portal`, …). Portals and bare primitives in stories need one on an ancestor.
- **Locale is part of every SWR cache key**, so switching locale refetches. Leave
  `isLocalized` at its default.
- **`src/msw` may not value-import `@api/*` or `@hooks/*`** — handlers load before per-test mocks
  apply and would break unrelated suites. Share contracts via `@schemas`.
- **`@api/**` may not import UI or feature code** (`@components`, `@ui`, `@blocks`, `@views`,
  `@icons`, `@assets`, `@hooks/features`, `@hooks/legacy`) and may not read `@providers`/
  `@contexts` at runtime. Wrap the hook in `@hooks/features/**` instead.
- **Every `@api` method file needs an MSW handler** at the mirrored path in `src/msw/api`;
  `npm run msw:check-coverage` enforces it in CI.
- **Production source may not import** `@msw/*`, `@fixtures/*`, `@test-utils/*`, or `*.stories*`.
- **Responsiveness is measured in JS**, not media queries — hence `ResponsiveComponent` and
  Chromatic's per-width iframe resizing.
- **Every story is a Chromatic snapshot.** Pack primitive variants into one gallery story
  rather than adding a story per variant.
- **`react-hooks/exhaustive-deps` is an error.** Fix the dependencies; don't disable the rule.
- **Pushing `.github/workflows/` changes needs the SSH remote** — HTTPS pushes are rejected.

## Useful abstractions

Reach for these before writing your own:

| Need | Use |
| --- | --- |
| One data object with loading/error/inactive states | `ConditionalBlock` |
| An array with loading/error/empty states | `ConditionalList` |
| Different components per width | `ResponsiveComponent` |
| Empty/error/loading visuals | `DataState`, `SkeletonLoader`, `SkeletonTableLoader` |
| Tables | `SimpleDataTable`, `DataTable`, `PaginatedDataTable`, `ExpandableDataTable`, `VirtualizedDataTable` |
| Forms | `useAppForm` + the `Form*Field` components; validators in `@utils/form/validators` |
| Pagination state | `@hooks/utils/pagination` (`usePaginationState`, `useTablePaginationProps`) |
| A GET / paginated GET / write | `createQueryHook` · `createInfiniteQueryHook` · `createMutationHook` |
| Cache invalidation after a write | `createResourceGlobalCacheActions` + `useOnTriggerSuccess` |
| Variant styling on a primitive | `toDataProperties` + `data-*` selectors |

## TypeScript and imports

`strict` is on (`noImplicitAny`, `strictNullChecks`, `noImplicitOverride`,
`useUnknownInCatchVariables`). Vite transpiles; `tsc` only typechecks.

- **No `any`.** Use `unknown` and narrow. Avoid `as` casts; when one is genuinely required at a
  boundary, add a short comment saying why.
- Prefer `type` aliases; use `interface` when you need declaration merging or self-reference
  (recursive schemas require it — see [`src/schemas/SKILL.md`](src/schemas/SKILL.md)).
- **Derive types instead of restating them:** `typeof Schema.Type`,
  `Parameters<typeof useHook>[0]`, `Pick<RawThing, …>`, `ReturnType<…>`.
- `readonly`/`ReadonlyArray` for data you don't own; `asMutable` (`@utils/asMutable`) at the
  boundary of an API that demands a mutable array.
- Shared utility types live in `src/types/utility/**`: `OneOf` (exclusive unions),
  `EnumWithUnknownValues` (open string enums), branded `EmailAddress`/`PhoneNumber`,
  `pagination`, `promises`. Check there before writing a new type-level helper.
- `src/types/**` is for internal-only types with no wire format. Anything the API sends or
  receives is a schema.
- Not yet enabled in `tsconfig.json` but worth honoring: `isolatedModules`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`.

Aliases, most specific first: `@ui/*`, `@blocks/*`, `@features/*`, `@components/*`, `@contexts/*`, `@api/*`, `@hooks/*`,
`@providers/*`, `@utils/*`, `@internal-types/*`, `@schemas/*`, `@views/*`, `@icons/*`,
`@assets/*`, `@msw/*`, `@fixtures/*`, `@test-utils/*`.

`simple-import-sort` enforces dependency-layer order: react → external →
(`@internal-types`, `@schemas`) → `@utils` → `@api` → `@hooks` → (`@providers`, `@contexts`) →
(`@icons`, `@ui`, `@blocks`) → (`@components`, `@features`, `@views`) → `@assets` →
(`@msw`, `@fixtures`, `@test-utils`) → styles.

Type imports are inline-style and enforced: `import { type Foo } from '…'`.

## Lint style rules

Single quotes (in JSX too), **no semicolons**, 2-space indent, 160-char lines, newline at EOF,
operators before line breaks, `_`-prefix to intentionally ignore a binding, `console` limited to
`warn`/`error`/`debug`.

Don't add explanatory comments describing what the code does. A short comment is warranted only 
for a non-obvious constraint — a workaround, a required ordering, why a cast is safe, etc.

## Commands and CI

| Command | What |
| --- | --- |
| `npm test` | vitest watch (`-- --run` for one pass) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint + stylelint, with auto-fix |
| `npm run storybook` | Storybook on :6006 |
| `npm run fixtures:generate` / `fixtures:check` | regenerate / verify committed fixtures |
| `npm run dev` | watch-build the library (`dev:js` + `dev:types`) |
| `npm run build` | production build (`build:js` esm + cjs, then `build:types`) |

Every PR runs `eslint`, `stylelint`, `typecheck`, `vitest`, `build`, `bundle-size` (fails past a
growth budget), `fixtures` (staleness check), `storybook`, `chromatic`, and `npm-audit`.

## Publishing

`@layerfi/components` ships from `src/index.tsx`; `prepack` runs `typecheck` plus a clean build.
See [`PUBLISHING.md`](PUBLISHING.md) and the `release-*` workflows. **Adding an export to
`src/index.tsx` is a public API change** — call it out in the PR.
