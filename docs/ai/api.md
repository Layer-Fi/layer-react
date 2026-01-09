#

## Curried API Functions

API functions are curried and type-safe:
```typescript
// API function builder
export const getBankTransactions = get<ReturnType, ParamsType>(
  (params) => `/v1/businesses/${params.businessId}/endpoint?${searchParams}`
)

// Usage in hooks
const fetcher = getBankTransactions(apiUrl, accessToken, { params })
useSWR(key, fetcher)
```

## URL Search Parameters

Use `toDefinedSearchParameters` for type-safe query strings:
```typescript
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'

const parameters = toDefinedSearchParameters({
  cursor,        // Strings passed as-is
  categorized,   // Booleans → strings
  startDate,     // Dates → ISO date strings (YYYY-MM-DD)
  sortBy,        // camelCase → snake_case
  limit,         // Numbers → strings
  tagValues,     // Arrays → multiple params with same key
  optional: null // null/undefined omitted
})
****
return `/v1/businesses/${businessId}/endpoint?${parameters}`
```