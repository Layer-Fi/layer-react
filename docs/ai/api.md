# API

- API functions are curried: `getBankTransactions(apiUrl, accessToken, { params })`
- Use `toDefinedSearchParameters` for query strings (handles camelCase→snake_case, null filtering, Date formatting)

## Schema Enforcement (Effect)

- **When consuming API response from backend, stop and ask user for backend API contract**
- **Reference:** `useVoidInvoice.tsx`
- Use for complex transformations, skip for internal-only types where simple TypeScript interfaces suffice

### File Structure

- Schema definitions: `/src/schemas/*.ts`
- Hooks that use schemas: `/src/hooks/*` or `/src/features/*/api/*`

### Key Patterns

- **Field transformation:** Use `Schema.fromKey('snake_case')` to convert to camelCase
- **Enum validation:** Use `Schema.transform` with safe defaults for unknown backend values
- **Type derivation:** Export types via `typeof Schema.Type`
- **Response validation:** Decode with `.then(Schema.decodeUnknownPromise(ResponseSchema))`
- **Response schemas:** Create separate schemas for list (`{ data: T[], meta }`) vs single-item (`{ data: T }`)
