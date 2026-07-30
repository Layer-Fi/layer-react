---
name: state-management
description: State management — which tool owns which state, provider-scoped Zustand stores, contexts, feature-visibility providers
applies_to: src/providers/**, src/contexts/**, src/utils/zustand/**
---

# State management

Three tools, three jobs. Picking the wrong one is the most common architectural mistake here.

| Tool | Owns | Examples |
| --- | --- | --- |
| **SWR** | server state: fetching, caching, revalidation | `useCustomAccounts`, `useListInvoices` — see [`src/hooks/SKILL.md`](../hooks/SKILL.md) |
| **Zustand** | UI state: selections, filters, route state | `BankTransactionsCategorizationStore`, `InvoicesRouteStore`, `DateStoreProvider` |
| **React Context** | dependency injection: config, auth, business data | `LayerProvider`, `BusinessProvider`, `BankTransactionsProvider` |

Never mirror server data into a Zustand store or `useState`. Derive it from the SWR hook,
and keep only the user's *choices* (which row is selected, which filter is active) in the store.

## Stores are provider-scoped, never global singletons

A consumer may mount two `BankTransactions` on one page; a module-level `create()` store
would leak state between them. Build every store with `createScopedStore`
(`@utils/zustand/createScopedStore`):

```tsx
const { Provider, useStoreApi, useSelector } = createScopedStore<MyStore>({ storeName: 'MyStore' })
```

- The `Provider` takes a `createStore` factory and calls it exactly once (`useConstant`).
- `useStoreApi`/`useSelector` throw a named error if used outside the Provider — that error
  message is the contract; don't silently fall back to a default store.
- Export narrow, purpose-named hooks from the provider module rather than exposing the raw
  store. `DateStoreProvider` is the model: `createScopedDateStore()` returns a
  `Provider` plus `useGlobalDateRange`, `useGlobalDateRangeActions`, `useGlobalDatePreset`,
  … and the module re-exports them under domain-specific names.
- **Split state selectors from action selectors** (`useXRange` vs `useXRangeActions`) so
  components that only dispatch don't re-render on value changes.
- Select the narrowest slice possible. For `Date` values use `useStoreWithDateSelected`
  (`@utils/zustand/useStoreWithDateSelected`) — it compares by `getTime()`, so a new `Date`
  with the same instant doesn't re-render.

## Date state

Do not build a new date store. `createScopedDateStore` already handles ranges, presets,
period-aligned actions, and clamping (`clampToPresentOrPast`, `clampToAfterActivationDate`).
Presets that resolve against the business activation date (e.g. `AllTime`) require the
Provider to be mounted **below** `BusinessProvider` and given a `fallback`.

## Contexts

`src/contexts/**` holds DI contexts, several per feature and deliberately narrow
(`BankTransactionsFiltersContext`, `BankTransactionsPaginationContext`,
`BankTransactionsStringOverridesContext`). Prefer adding a new small context over widening
an existing one — a fat context re-renders every consumer.

`LayerContext` is the root: API URL, auth, environment, theme, locale. Read it through
`useLayerContext` or, better, the purpose-built hooks (`useAuth`, `useBusiness`,
`useEnvironment`) rather than `useContext` directly.

## Feature visibility

Optional features are gated by a visibility provider that carries a feature-flag record,
not by threading booleans through props. `BankTransactionsFeatureVisibilityProvider` is the
model: a `BankTransactionsFeature` enum, a `DEFAULT_FEATURE_VISIBILITY` record, and a
`useIsBankTransactionsFeatureEnabled(feature)` accessor. Do not scatter
`if (props.showX)` conditionals through a component tree.

## Never set state during render

Call `setState` from an effect, not inline in a render body — including "derive on first
render" shortcuts. If a value depends on props, compute it, or reset via an effect.

## Related

- [`src/hooks/SKILL.md`](../hooks/SKILL.md) — the server-state half
- [`src/components/SKILL.md`](../components/SKILL.md) — where providers get mounted
