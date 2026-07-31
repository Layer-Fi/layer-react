---
name: hooks
description: Hooks — directory taxonomy (features/utils/legacy), where a new hook goes, composition and return conventions
applies_to: src/hooks/features/**, src/hooks/utils/**, src/hooks/legacy/**, src/hooks/*.ts
---

# Hooks

`src/hooks` is split by *kind* of hook, not by feature alone. Data loading lives in
`src/hooks/api/**` and has its own doc — [`src/hooks/api/SKILL.md`](./api/SKILL.md); 
this file covers everything else.

| Directory | Contains | Add here when |
| --- | --- | --- |
| `api/**` | one SWR hook per endpoint, mirroring the REST path | the hook calls exactly one endpoint |
| `features/**` | feature logic composed from API hooks, contexts, and stores | the hook combines data with feature behavior |
| `utils/**` | generic, feature-agnostic hooks, grouped by domain | the hook would make sense in any React app |
| `legacy/**` | pre-factory SWR hooks | never — migrate out, don't add |


## `features/**` — the composition layer

One subdirectory per feature (`bankTransactions`, `bookkeeping`, `timeTracking`,
`taxEstimates`, …). These hooks do no raw fetching; they orchestrate:

- wrap an API mutation with cache/context side effects and event callbacks —
  `useCategorizeBankTransactionWithCacheUpdate` is the model (API trigger → update local
  context data → fire `eventCallbacks`); the `...WithCacheUpdate` suffix marks the pattern
-  transform over API data (`useAugmentedBankTransactions`, `useActiveBookkeepingPeriod`)
- third-party integrations (`calendly/useCalendly`, `linkedAccounts/usePlaidLinkModal`)

## `utils/**` — generic building blocks

Put a hook here only if it knows nothing about Layer's domain — it should make sense in any
React app. If it imports a feature type, schema, or store, put it in `features/**` instead.
Before writing a new utility hook, scan the matching group below — the primitive you need
probably exists, and a near-duplicate is worse than none. Add to the group it fits; create a
new subdirectory only for a genuinely new domain.

- `react/` — React lifecycle primitives: init-once values, stable refs, mount-only effects.
- `pagination/` — client-side pagination state; use it instead of hand-rolling page-index.
- `debouncing/` — debounced values and search queries; do not inline your own timers.
- `size/` — DOM measurement observers; use them instead of reading `getBoundingClientRect`.
- `dates/`, `i18n/`, `tables/`, `visibility/` — date bounds and elapsed time, locale-aware
  formatters, table column/row behavior, viewport visibility.
- `auth/` — the auth-token source API hooks build keys from; never duplicate token handling.
- `swr/` — query/mutation factory internals, owned by
  [`src/hooks/api/SKILL.md`](./api/SKILL.md); never import from it in feature code.

## `legacy/**` — frozen

Hand-rolled SWR hooks (`useChartOfAccounts`, `useJournal`, `useReceipts`, …) that pre-date
the factories. Do not add hooks here or copy their patterns.

## Related

- [`src/hooks/api/SKILL.md`](./api/SKILL.md) — data loading, factories, cache actions
- [`src/providers/SKILL.md`](../providers/SKILL.md) — where stores and contexts live
