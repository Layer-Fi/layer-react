---
name: import-boundaries
description: The layer stack and feature-domain boundaries — which direction imports may point, why each layer sits where it does, and how to fix a boundary error
applies_to: src/**
---

# Import boundaries

Two rules, both lint-enforced from one table at the top of `eslint.config.mjs`. Nothing here is
advisory — a violation fails `npm run lint`. Tier names in the error messages match this doc.

## The layer stack

Every file belongs to exactly one layer and may import from strictly **lower** layers only. Read
the table bottom-up and it describes how a request flows: contracts, then the config the app is
handed, then the hooks that fetch with it, then the state that holds the result, then the UI that
renders it.

| # | Layer | Holds |
| --- | --- | --- |
| 1 | foundation | `@internal-types` `@schemas` `@utils` `@icons` `@assets` — API contracts, pure functions, static assets. Depends on nothing internal. |
| 2 | context | `@providers/global` `@providers/common` — config the consumer hands us (business id, auth, environment, locale) and the DI plumbing that distributes it. Never fetches. |
| 3 | generic hooks | `@hooks/utils` — React hooks with no domain knowledge, including the `createQueryHook`/`createMutationHook` factories every endpoint hook is built from. |
| 4 | data loading | `@api` — one SWR hook per endpoint, in a tree mirroring the REST path. |
| 5 | stores | `@providers/features` `@hooks/legacy` — per-domain Zustand stores holding the user's choices, plus the contexts that distribute them. |
| 6 | feature hooks | `@hooks/features` — feature behavior composed from endpoints, stores, and context. No raw fetching. |
| 7 | render helpers | `@components/utility` — `ConditionalBlock`, `ResponsiveComponent`, `withRenderProp`. |
| 8 | primitives | `@ui` — design-system components. Domain-agnostic: never imports a schema, a fetching hook, or a feature. |
| 9 | patterns | `@blocks` — primitives composed into reusable shapes: tables, cards, wizards, form fields. Still domain-agnostic. |
| 10 | feature UI | `@features` — one directory per domain object; fetches its own data. |
| 11 | views | `@views` — full-page compositions that mount the providers a feature needs. |
| 12 | app root | `LayerProvider` and `src/index.tsx` — assembles the provider stack and defines the published API. |

### Why context and stores sit where they do

Two placements read backwards at first.

**Context sits below generic hooks** (2 below 3) because `useAuth` and `useBuildKeyInputs` read
`LayerContext`, and all ~140 endpoint hooks are built on factories that call them. Putting
injected config at the bottom is what makes the whole data layer orderable; if context sat above
the hooks, every SWR factory would be pointing upward.

**Stores sit below feature hooks** (5 below 6) because that is the direction the code already ran:
about 38 imports of `@providers` from `@hooks/features`, against 7 the other way. A provider that
needs a value a feature hook computes takes it as a prop, and the component rendering the provider
calls the hook.

### Fixing a boundary error

A violation means one of three things, and the fix follows from which:

- **The thing you reached for belongs lower.** A pure helper, a type, or a constant that merely
  happens to live in a high layer. Move it down — the common case, and it needs no indirection.
- **You need a value the layer above computes.** Take it as a prop or an argument and let the
  caller, which already sits high enough, do the computing. `BusinessProvider` takes
  `slots={{ Toasts }}` rather than importing `ToastsContainer` from `@blocks`.
- **Your file is in the wrong layer.** A hook that reads a store and an endpoint is a layer-5
  store hook, not a layer-6 feature hook, whatever directory it currently sits in.

Reaching for an `eslint-disable` is a fourth option and almost always the wrong one — it hides the
question rather than answering it.

### Exemptions

`src/hooks/legacy` is exempt from its own outbound checks. It predates the layers and is being
deleted; lower layers still cannot import it. Don't add files there.

Tests and stories (`*.test.*`, `*.spec.*`, `*.stories.tsx`, `*.storyData.tsx`) are exempt from both
rules. The boundaries protect the shipped artifact, and `tsconfig.build.json` excludes exactly
those files — a test may reach up to whatever it needs to mount its subject. The reverse rule still
holds: production source may not import `@msw`, `@fixtures`, `@testUtils` or story modules.
`src/fixtures` may reach only the foundation; `src/msw` adds `@fixtures`.

## Feature domains

Five directories are partitioned by domain. Within each, a domain may import **itself** plus a
declared shared set, and nothing else:

| Partition | Shared domains |
| --- | --- |
| `src/schemas/features` | `customerVendor` `tags` `business` `generalLedger` `bankTransactions` |
| `src/components/features` | `reports` `customerVendor` `tags` `customAccounts` `bookkeeping` `generalLedger` |
| `src/hooks/features` | `forms` `calendly` `business` |
| `src/providers/features` | `business` `bankAccounts` `bookkeeping` |
| `src/utils/features` | — |

The shared sets are the domains other domains legitimately build on: accounting primitives in
`schemas`, and reusable scaffolding in `components` — report shells, entity pickers, status badges.
`bankTransactions` and `categorization` count as one boundary; they are one feature.

To let a new cross-domain import through, either move the shared code down a layer or add the
target to that partition's shared set. Both are deliberate edits to the table, which is the point.
Domain lists are read from disk, so the rules cannot drift from the tree.

A domain name means the same thing everywhere: `invoices` under `schemas/features`,
`hooks/features`, `providers/features`, `utils/features` and `components/features` are the same
domain's contracts, hooks, stores, helpers and UI.

## Import order

`simple-import-sort` sorts by layer, lowest first, so an import block reads bottom-up through the
stack. The group list is generated from the same alias table that drives the boundary rules, so
the two cannot drift. Run `npm run lint:fix`; never sort by hand.

Adding a path alias means editing `tsconfig.json` **and** the alias table in `eslint.config.mjs` —
the latter feeds the sort order and the `no-relative-parent-imports` ignore list, so a missed entry
breaks every import through the new alias.
