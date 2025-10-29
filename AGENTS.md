# Project Guidelines

## Code Style

### React Components
- For text, use `Span` from `../ui/Typography/Text` instead of lowercase `<span>`.
- Use `<HStack>` and `<VStack>` from `../ui/Stack/Stack` instead of `div`.
- When possible, build on top of existing components in `../ui` instead of creating new ones.

### CSS Styling
- Do not use in-line styling aside from existing props.
- Avoid adding unnecessary css classes and use existing props when possible.
- When creating css, make a .scss file with the same name as the .ts or .tsx file and directly import the .scss file. Do not use any index.ts files.
- Prefer to use multiples of 4 (e.g. 8, 16, 24, 32, 240) for px/rem values, and the design system spacing scale (`--spacing-xs: 8px`, `--spacing-md: 16px`, etc.) when appropriate.

#### CSS Component Scoping

All component styles are scoped under class prefixes:
- `.Layer__component` for UI primitives
- `.Layer__view` for full-page views
- `.Layer__table`, `.Layer__button`, etc.

## Architecture

### Multi-Layer State Management

This codebase uses **three different state management patterns** that work together:

1. **SWR for server state** (data fetching, caching, revalidation)
   - Custom hooks like `useBankTransactions`, `useProfitAndLoss`
   - Tag-based cache invalidation system (see "Cache Invalidation Pattern" below)
   - Global cache actions: `invalidate()`, `optimisticUpdate()`, `forceReload()`

2. **Zustand for UI state** (selections, filters, temporary UI state)
   - Provider-scoped stores (one instance per component tree)
   - Examples: `BankTransactionsCategoryStoreProvider`, `BulkSelectionStoreProvider`
   - Pattern: Create store with `useState(() => createStore())` and provide via Context

3. **React Context for DI** (configuration, business data, theme, auth)
   - Main provider: `LayerProvider` wraps `BusinessProvider`
   - Feature-specific contexts: `BankTransactionsProvider`, `CategorizationRulesProvider`

### Cache Invalidation Pattern

SWR keys include a `tags` array for grouped invalidation:

```typescript
// Key includes tags for bulk invalidation
useSWR({
  accessToken,
  apiUrl,
  businessId,
  params,
  tags: ['#bank-transactions']  // Tag-based cache key
})

// Invalidate all keys with a specific tag
invalidate(tags => tags.includes(BANK_TRANSACTIONS_TAG_KEY))
```

This allows invalidating multiple related cache entries without knowing exact cache keys.

### Provider-Scoped Zustand Stores

Stores are **instantiated per component tree** (not global singletons):

```typescript
// In provider component
const [store] = useState(() => createBankTransactionsCategoryStore())

// Consumers use context + selectors
const category = useStore(store, state => state.transactionCategories.get(id))
```


### API Layer Pattern

API functions are **curried** and type-safe:

```typescript
// API function builder
export const getBankTransactions = get<ReturnType, ParamsType>(
  (params) => `/v1/businesses/${params.businessId}/endpoint?${searchParams}`
)

// Usage in hooks
const fetcher = getBankTransactions(apiUrl, accessToken, { params })
useSWR(key, fetcher)
```

### Feature Visibility Toggles

Use context-based visibility providers for feature flags:

```tsx
<BankTransactionTagVisibilityProvider isVisible={true}>
  <BankTransactionCustomerVendorVisibilityProvider isVisible={false}>
    {children}
  </BankTransactionCustomerVendorVisibilityProvider>
</BankTransactionTagVisibilityProvider>
```

## Testing
1. Run `npm run typecheck` and fix any issues
2. Run `npm run lint` and fix any issues
3. Instruct the user on specific manual tests to perform
