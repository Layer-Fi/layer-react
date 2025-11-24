# Project Guidelines

## Code Style

- Run `npm run lint --fix` to fix lint errors. Do not fix them manually.

### React Components
- For text, use `Span` from `../ui/Typography/Text` instead of lowercase `<span>`.
- Use `<HStack>` and `<VStack>` from `../ui/Stack/Stack` instead of `div`.
- When possible, build on top of existing components in `../ui` instead of creating new ones.

### CSS Styling
- Do not use in-line styling aside from existing props.
- Avoid adding unnecessary css classes and use existing props when possible.
- When creating css, make a .scss file with the same name as the .ts or .tsx file and directly import the .scss file. Do not use any index.ts files.
- Use the design system spacing scale (`--spacing-xs: 8px`, `--spacing-md: 16px`, etc.) when appropriate.

#### CSS Component Scoping

All component styles are scoped under class prefixes:
- `.Layer__component` for UI primitives
- `.Layer__view` for full-page views
- `.Layer__table`, `.Layer__button`, etc.

## Architecture

### Multi-Layer State Management

This codebase uses **three different state management patterns** that work together:

1. **SWR for server state** (data fetching, caching, revalidation)
   - Custom hooks like `useBankTransactions`, `useProfitAndLossReport`
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

### URL Search Parameters Pattern

Use `toDefinedSearchParameters` to build type-safe URL query strings:

```typescript
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'

// In API function
const parameters = toDefinedSearchParameters({
  cursor,            // Strings passed as-is
  categorized,       // Booleans converted to strings
  startDate,         // Dates formatted to ISO date strings (YYYY-MM-DD)
  sortBy,            // camelCase keys converted to snake_case
  limit,             // Numbers converted to strings
  tagValues,         // String arrays expanded to multiple params
  optional: null,    // null/undefined values omitted from output
})

// Returns URLSearchParams ready for API URLs
return `/v1/businesses/${businessId}/endpoint?${parameters}`
```

**Key features:**
- Automatically filters out `null`/`undefined` values
- Converts camelCase keys to snake_case (e.g., `startDate` → `start_date`)
- Formats Date objects to ISO date strings (`YYYY-MM-DD`)
- Handles arrays by creating multiple parameters with the same key
- Type-safe: only accepts `Date | string | string[] | number | boolean | null | undefined`

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
