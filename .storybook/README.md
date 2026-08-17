# Storybook backend modes

The default command is MSW-backed and deterministic:

```sh
npm run storybook
```

Real mode points the same stories at a live Layer business. It needs the token endpoint, so run
`vercel dev` alongside it:

```sh
npm run storybook:real
```

## Who this is for

Layer engineers and designers, running locally or on the access-protected per-PR Vercel preview.
It is not a demo client for customers — `demo-finguard` owns that.

## Choosing a business

Paste a business ID into the toolbar field. It is a free-text input rather than a dropdown because
demo businesses are replaced often — any curated list would go stale and need re-curating, and a
pinned ID fails quietly, since the abandoned business still exists and still reads as a demo.

The ID is a Storybook global, so it serializes into the URL and a story link carries its business
with it (`?globals=business:<id>`). The last eight you've used are kept in `localStorage` and offered
as autocomplete, and the most recent is restored on a bare visit, so nobody retypes a UUID. An ID in
the URL always wins over the remembered one.

Autocomplete entries read `Legal Name — <full id>`, and the badge shows the name alongside a
truncated id — a bare UUID tells you nothing about what you're looking at, and the name alone doesn't
tell you which of two similarly named businesses you picked. The name is `legalName` off
`BusinessSchema`, on the same SWR key the `isDemo` guard uses, so it costs no extra request.

Until an ID is set, stories say so rather than rendering. Real mode never falls back to fixtures —
mock data under a real-backend build would look like the real thing.

Real mode also refuses to render a business whose `isDemo` flag is false, and the badge in the
bottom-right shows the environment, the active ID, and how long the current token has left.

## Credentials

`api/storybook-token.ts` mints a short-lived business access token. The Layer app secret stays in
that function and the browser never sees more than the token, which is why real mode needs a server
even locally. The endpoint refuses to mint against a production environment.

It returns the environment alongside the token, so the provider can't drift out of sync with the
scope the token was minted for. `LAYER_ENVIRONMENT` has to match the environment the
business actually lives in, or the token won't see it. Production is absent from the function's scope
map rather than special-cased, so an unexpected value fails closed.

The function is self-contained, and `api/package.json` marks the directory ESM: the root package is
`type: commonjs`, so a compiled handler with `import` statements will not load, and under ESM an
extensionless relative import into `src/` will not resolve at runtime either.

## The deployed preview

Vercel project `layer-react-storybook` (LayerFinancial), connected to this repo. Every PR gets a
preview; `main` is skipped by an Ignored Build Step, so there is no long-lived deployment pointed at
a real business. Vercel Authentication is on, which gates `/api/storybook-token` as well as the
pages, and fork PRs require authorization before building.

### The `STORYBOOK_` prefix is a boundary, not a convention

Storybook inlines every `STORYBOOK_`-prefixed variable into the client bundle, so the prefix decides
whether a value is public:

| Prefix | Read by | Safe for secrets |
| --- | --- | --- |
| `STORYBOOK_LAYER_*` | the browser, inlined at build time | **no** |
| `LAYER_*` | the token function, at request time | yes |

`STORYBOOK_LAYER_BACKEND` and `STORYBOOK_LAYER_TOKEN_ENDPOINT` need the prefix — the preview reads
them. `LAYER_APP_ID`, `LAYER_APP_SECRET` and `LAYER_ENVIRONMENT` must never gain it: prefixing
`LAYER_APP_SECRET` would publish the app secret into `assets/iframe-*.js` with no error and no
warning. Server-side names deliberately contain no `STORYBOOK` token at all, so the two groups can't
be confused for each other.

All five are scoped to Preview only.

## Which stories appear

`npm run storybook:real` shows the whole index. The deployed build sets `STORYBOOK_SCOPE=real`,
which narrows it to stories tagged `real-backend` — the ones that still mean something with MSW
off. See `.storybook/tags.ts` for the rule and `SKILL.md` for the authoring convention.

## What real mode cannot do

MSW is not registered at all, so **meta-level `parameters.msw.handlers` are inert too** — they stop
applying rather than erroring. Usually that is the point, since the file's baseline gives way to
real data. It bites where a meta baseline *enables a feature*: `TaxEstimates` mocks
`enableTaxEstimates`, so every one of its stories is excluded from the real build.

Also:

- The fixture clock is off, so date-ranged stories query the real current period. A business
  without recent data renders empty views.
- Mutating interactions (categorize, approve) hit the real business and dirty it.
- `BookkeepingDisabled` is the tagged half of both `Bookkeeping*` pairs. It shows whatever status
  the business actually has, so its name overclaims.
- Coverage varies by business. Before concluding a component is broken, try another one.

## Do not publish

The GitHub Pages deploy (`storybook-pages.yml`) is mock-backed and public, and stays that way. The
real-backend build belongs only on a deployment with Vercel Authentication enabled.
