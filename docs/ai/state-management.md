# State Management

This codebase uses three state management patterns together:

## SWR — Server State

Data fetching, caching, and revalidation.

- Custom hooks: `useBankTransactions`, `useProfitAndLossReport`, etc.
- Tag-based cache invalidation (see below)
- Global cache actions: `invalidate()`, `optimisticUpdate()`, `forceReload()`

### Cache Invalidation

SWR keys include a `tags` array for grouped invalidation:
```typescript
// Key includes tags
useSWR({
  accessToken, apiUrl, businessId, params,
  tags: ['#bank-transactions']
})

// Invalidate all keys with a specific tag
invalidate(tags => tags.includes(BANK_TRANSACTIONS_TAG_KEY))
```

## Zustand — UI State

Selections, filters, temporary UI state.

- Provider-scoped stores (one instance per component tree, not global singletons)
- Pattern: `useState(() => createStore())` + Context
```typescript
// In provider
const [store] = useState(() => createBankTransactionsCategoryStore())

// Consumer
const category = useStore(store, state => state.transactionCategories.get(id))
```

Examples: `BankTransactionsCategoryStoreProvider`, `BulkSelectionStoreProvider`

## React Context — Dependency Injection

Configuration, business data, theme, auth.

- Main provider: `LayerProvider` wraps `BusinessProvider`
- Feature contexts: `BankTransactionsProvider`, `CategorizationRulesProvider`

### Feature Visibility Toggles
```tsx
<BankTransactionTagVisibilityProvider isVisible={true}>
  <BankTransactionCustomerVendorVisibilityProvider isVisible={false}>
    {children}
  </BankTransactionCustomerVendorVisibilityProvider>
</BankTransactionTagVisibilityProvider>
```