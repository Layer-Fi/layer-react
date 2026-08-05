---
name: state-management
description: State management — choosing between SWR, Zustand, and React Context; provider-scoped store pattern, DI contexts, feature visibility
applies_to: src/providers/**, src/utils/zustand/**
---

# State management

Three tools, three jobs. Picking the wrong one is the most common architectural mistake here.

| Tool | Owns | Examples |
| --- | --- | --- |
| **SWR** | server state: fetching, caching, revalidation, mutation | `useGetCustomAccounts`, `useGetListInvoices` — see [`src/hooks/api/SKILL.md`](../hooks/api/SKILL.md) |
| **Zustand** | client state shared across a feature subtree: route state, filters, selections, page indices, drawer/modal state | `BankTransactionsRouteStore`, `InvoicesRouteStore`, `BulkSelectionStore`, `UnifiedReportStore` |
| **React Context** | dependency injection: auth, environment, config, string overrides — and distributing a Zustand store instance | `AuthInputProvider`, `EnvironmentInputProvider`, `BankTransactionsStringOverridesContext` |

Server data lives in the SWR cache and nowhere else — read it through the hook wherever it's
needed; the cache dedupes. Zustand stores hold the user's *choices* (which row is selected,
which filter is active, which sub-route is showing), keyed by IDs when they reference server
entities. `useState` is fine for state local to one component; reach for a store once state
must be shared across a subtree.

## Layout

`src/providers/<domain>/<Concern>/`. A concern's context, its provider, and its helpers are
colocated in that one directory; a bare context never lives apart from the provider that
supplies it.

Two buckets are not domains. `global/` is exactly the provider stack `LayerProvider` mounts —
add to it only when you are adding a provider every consumer gets. `common/` is reusable,
domain-agnostic machinery (`BulkSelectionStore`, the `DateStore` factory, `InAppLink`); put a
store here rather than in a domain when a `@blocks` component consumes it, since a block may
not depend on a feature domain. Nothing in `common/` may import `global/` or a domain — inject
what it needs instead, the way `createScopedDateStore` takes a `useActivationDate` hook rather
than reading `LayerContext` itself.

## Zustand stores are provider-scoped, never global singletons

A consumer may mount two `BankTransactions` on one page; a module-level store would leak
state between them. Every store follows the same shape — see
`bankTransactions/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider.tsx` for the
canonical example:

- A module-level `createContext(createStore(<no-op defaults>))` supplies an inert default
  so hooks are safe (but dead) outside the Provider.
- The Provider builds the real store once with `useState(() => createStore(set => ({ ... })))`
  and passes it through the context.
- Store shape: flat state fields plus a nested `actions: { ... }` object (and `navigate: { ... }`
  for route transitions).
- Consumers never touch the raw store. Export narrow, purpose-named hooks
  (`useContext` + `useStore(store, selector)`) from the provider module.
- **Split state selectors from action selectors** so components that only dispatch don't
  re-render on value changes. Hooks returning multiple values `useMemo` the result object.
- Select the narrowest slice possible. For `Date` values use `useStoreWithDateSelected`
  (`@providers/common/DateStore/useStoreWithDateSelected`) — it compares by `getTime()`, so a new `Date`
  with the same instant doesn't re-render.

`createScopedStore` (`@providers/common/store/createScopedStore`) is a generic version of this
pattern that throws instead of falling back to a dead store; today only the date store
uses it. The hand-rolled shape above is the prevailing idiom for feature stores.

## Date state

Do not build a new date store. `createScopedDateStore` already handles ranges, presets, and
period-aligned actions; `global/GlobalDateStore/GlobalDateStoreProvider` re-exports its hooks
under domain names and applies clamping (`clampToPresentOrPast`, `clampToAfterActivationDate`
from `@utils/shared/date/dateRange`). A domain that needs different defaults builds its own scoped store in its
own directory, as `generalLedger/LedgerDateStore` does for its `AllTime` default.

## Contexts

Context is for values that are stable for the life of the subtree: credentials
(`AuthInputProvider`), environment (`EnvironmentInputProvider`), locale (`LayerI18nProvider`),
string overrides, feature-flag records — and for carrying store instances. The canonical
shape is `createContext(defaults)`, a `useMemo`'d value, and a single `useX()` reader.

Don't hold frequently-changing state in a context via `useState`/`useReducer` in the
provider — every consumer re-renders on any change. Use a Zustand store with selector hooks
instead. (`BusinessProvider`/`LayerContext` and a few older providers predate this rule;
don't copy them.)

### One concern per context/provider

Each context or provider owns a single concern; a feature composes several of them rather
than one omnibus provider. Bank transactions is the model — separate units for routing
(`BankTransactionsRouteStore`), filters (`BankTransactionsFiltersContext`), pagination
(`BankTransactionsPaginationContext`), string overrides
(`BankTransactionsStringOverridesContext`), feature flags
(`BankTransactionsFeatureVisibilityProvider`), in-flight categorization picks
(`BankTransactionsCategorizationStore`), and bulk selection (`common/BulkSelectionStore`,
which is domain-agnostic and shared).
Prefer adding a new small context over widening an existing one — a fat context re-renders
every consumer on any change, and narrow units can be mounted independently where needed.

`LayerContext` is the root: API URL, auth, environment, theme, locale. Read it through
`useLayerContext` or, better, the purpose-built hooks (`useAuth`, `useGetBusiness`,
`useEnvironment`) rather than `useContext` directly.

## Syncing into stores

Stores may *reconcile* against SWR data or props via an effect — but only narrowly:

- Prune selections that reference entities no longer in the server list
  (`BankAccountsFilterStore` retains only IDs still present in `useGetBankAccounts()`).
- Seed an initial/default value once (`useHydrateUnifiedReportStore`).
- Push a prop into the store when the store is the subtree's source of truth for it
  (`TimeEntriesStore`).

Never copy server data wholesale into a store as a second source of truth — derive from the
SWR hook at the point of use.

## Related

- [`src/hooks/api/SKILL.md`](../hooks/api/SKILL.md) — the server-state half
- [`src/components/SKILL.md`](../components/SKILL.md) — where providers get mounted
