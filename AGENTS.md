# Agent Instructions

- Do not make assumptions on unclear task details — ask for clarification
- For significant changes, provide implementation options with a recommended approach before coding
- Refer to documentation files below when relevant to current task
- If user provides information broadly relevant to codebase, ask if it should be added to relevant docs
- Generate designs and code in reviewable phases
- After phase completion, stop and ask for feedback

# Codebase Conventions

- Run `npx lint-staged` to fix lint errors
- Run `npm run typecheck` and fix any issues before completing work

# Components

## Text & Layout

- Use `Span` from `../ui/Typography/Text` instead of `<span>`
- Use `<HStack>` and `<VStack>` from `../ui/Stack/Stack` instead of `<div>`
- Build on existing components in `../ui` before creating new ones

# Style

## General Rules

- No inline styles — use existing component props
- Avoid unnecessary CSS classes — use existing props when possible
- Use design system spacing scale (`--spacing-xs: 8px`, `--spacing-md: 16px`, etc.)

## File Organization

- Create `.scss` file with same name as `.ts`/`.tsx` file
- Import `.scss` directly — no `index.ts` barrel files

## Class Naming

All component styles are scoped under class prefixes:

- `.Layer__component` — UI primitives
- `.Layer__view` — full-page views
- `.Layer__table`, `.Layer__button`, etc. — specific components

# Documentation

- **Styling:** `docs/ai/styling.md`
- **State Management:** `docs/ai/state-management.md`
- **API Layer:** `docs/ai/api-layer.md`




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

