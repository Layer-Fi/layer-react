# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@layerfi/components** is a React component library for embedded accounting experiences. It's published to NPM and consumed by other applications.

- **Type**: Component library (not an application)
- **Build output**: Dual module format (ESM + CJS) at `dist/`
- **Stack**: React 18, TypeScript 5.8, Vite 6, SCSS, SWR, Zustand, TanStack Table/Form

## Development Commands

### Building
```bash
npm run build              # Build both ESM and CJS
npm run build:clean        # Clean dist/ and build
npm run dev                # Watch mode (ESM only)
npm run typecheck          # Type check without emitting
```

### Linting
```bash
npm run lint               # Run both ESLint and Stylelint
npm run lint:eslint        # Lint TypeScript/JavaScript only
npm run lint:stylelint     # Lint CSS/SCSS only
```

**Note**: No test suite exists yet. Linting and type checking are the primary quality gates.

### Pre-publish
```bash
npm run prepack            # Automatically runs: typecheck + build:clean
```

## Code Architecture

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

This prevents state leakage between multiple component instances.

### Feature-First Organization

The `/features` directory uses a **route-like structure** for domain-specific code:

```
features/
  └── bankTransactions/
      └── [bankTransactionId]/
          ├── tags/                    # Tag management feature
          ├── customerVendor/          # Customer/vendor feature
          └── api/                     # Transaction-specific API
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

## Styling Rules

### Spacing Convention (CRITICAL)

**Always use multiples of 4** for CSS/SCSS measurements:
- ✅ Good: `8px`, `16px`, `24px`, `32px`, `240px`
- ❌ Bad: `10px`, `15px`, `25px`

This matches the design system spacing scale (`--spacing-xs: 8px`, `--spacing-md: 16px`, etc.).

**Prefer `rem` over `px`** when appropriate for better accessibility and scalability.

### Component and Styling Best Practices

**File Organization**:
- Create a `.scss` file with the **same name** as the `.ts` or `.tsx` file
- Import the `.scss` file directly in the component (not via index files)
- Example: `MyComponent.tsx` → `MyComponent.scss`

**Component Usage**:
- **Use existing UI components** from `../ui/` instead of creating new ones
- **Use `<HStack>` and `<VStack>`** from `../ui/Stack/Stack` instead of divs with CSS classes
- **Use `<Span>`** from `../ui/Typography/Text` instead of lowercase `<span>` elements
- **Avoid unnecessary CSS classes** - use existing component props when possible
- **No inline styles** except through existing component props

### Component Scoping

All component styles are scoped under class prefixes:
- `.Layer__component` for UI primitives
- `.Layer__view` for full-page views
- `.Layer__table`, `.Layer__button`, etc.

### Styling Architecture

- **Global styles**: `/src/styles/` (e.g., `bank_transactions.scss`, `table.scss`)
- **Component styles**: Co-located with components (e.g., `journalEntryForm.scss`)
- **Single bundle**: All styles compile to `dist/index.css`

### Customization Layers

1. **Theme prop** on `LayerProvider` - Generates color palette from HSL/RGB/HEX
2. **CSS variables** - Override specific design tokens (see `variables.scss`)
3. **CSS classes** - Fine-grained overrides with higher specificity

## Component Patterns

### Compound Components

```tsx
<ProfitAndLoss>
  <ProfitAndLoss.Chart />
  <ProfitAndLoss.Summaries />
  <ProfitAndLoss.DatePicker />
  <ProfitAndLoss.Table />
</ProfitAndLoss>
```

### Provider Composition

Wrap features with multiple providers for state isolation:

```tsx
<ErrorBoundary onError={onError}>
  <CategorizationRulesProvider>
    <BankTransactionsRouteStoreProvider>
      <BankTransactionsProvider>
        {children}
      </BankTransactionsProvider>
    </BankTransactionsRouteStoreProvider>
  </CategorizationRulesProvider>
</ErrorBoundary>
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

## Authentication Modes

### Production Mode
```tsx
<LayerProvider
  businessId="..."
  businessAccessToken="..."  // Short-lived, business-scoped
  environment="production"
>
```

### Development Mode
```tsx
<LayerProvider
  businessId="..."
  appId="..."       // Sandbox credentials
  appSecret="..."   // Avoids token fetching
  environment="staging"
>
```

## Code Quality Rules

### Enforced by ESLint/Stylelint
- **No CSS imports** in TypeScript files (styles must be bundled separately)
- **No `console.log`** (use `console.warn`, `.error`, `.debug`)
- **Exhaustive deps** for React Hooks (error level)
- **Unused imports** removed automatically
- **Single quotes** for strings, JSX
- **No semicolons**
- **2-space indentation**
- **Max line length**: 160 characters
- **CSS property ordering**: positioning → display → flex → box model → typography

### Pre-commit Hooks
- Husky + lint-staged runs `stylelint --fix` on `*.{css,scss}` files

## Non-Obvious Patterns

### Date Comparisons in Zustand

Use `getTime()` for date comparisons to avoid reference equality issues:

```typescript
// Custom hook prevents unnecessary rerenders
useStoreWithDateSelected(store, state => state.selectedDate.getTime())
```

### Optimistic Updates

Update cache immediately before revalidation:

```typescript
optimisticUpdate(
  predicateFn,
  (data) => transformData(data),
  { withPrecedingOptimisticUpdate: true }
)
```

### Monthly View Infinite Scroll

Date filter mode determines pagination:
- **Monthly view**: Infinite scroll with intersection observer
- **Standard view**: Traditional page-based pagination

### Debounced Cache Invalidation

Prevents excessive revalidation during bulk operations:

```typescript
// 1s debounce, 3s max wait
const debouncedInvalidate = debounce(invalidate, 1000, { maxWait: 3000 })
```

## Key Entry Points

- **Main export**: [src/index.tsx](src/index.tsx)
- **Build config**: [vite/vite.config.ts](vite/vite.config.ts)
- **Type declarations**: Generated at `dist/index.d.ts` (via vite-plugin-dts)
- **Style bundle**: `dist/index.css` (includes all SCSS)

## Documentation

- **Public docs**: https://docs.layerfi.com/introduction
- **NPM package**: https://www.npmjs.com/package/@layerfi/components
- **Component examples**: See [README.md](README.md) for usage patterns
