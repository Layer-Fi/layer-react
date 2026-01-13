# State Management

- **SWR:** Server state (fetching, caching) — `useBankTransactions`, `useProfitAndLossReport`
- **Zustand:** UI state (selections, filters) — `BankTransactionsCategoryStoreProvider`
- **React Context:** DI (config, auth, business data) — `LayerProvider`, `BankTransactionsProvider`

## Key Patterns

- **SWR cache invalidation:** Keys include `tags` array; invalidate with `invalidate(tags => tags.includes(TAG_KEY))`
- **Zustand stores:** Provider-scoped (not global singletons) — create with `useState(() => createStore())` + Context
- **Feature toggles:** Use `*VisibilityProvider` wrappers with `isVisible` prop