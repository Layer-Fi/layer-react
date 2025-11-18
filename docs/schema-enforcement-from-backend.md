# Schema (Effect) Docs

- This is an example of a well-written API Schema file: `useVoidInvoice.tsx`
  
### 1. **Define Schemas for Backend Data Structures**

Create schema files in `/src/schemas/` that match your backend API responses:

```typescript
// Example: src/schemas/customer.ts
import { Schema, pipe } from 'effect'

// Define the schema structure
export const CustomerSchema = Schema.Struct({
  id: Schema.UUID,
  
  // Handle snake_case to camelCase transformation
  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),  // Maps API's 'external_id' to 'externalId'
  ),
  
  individualName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('individual_name'),
  ),
  
  email: Schema.NullOr(Schema.String),
  status: TransformedCustomerStatusSchema,  // Custom transformation (see below)
})

// Export the TypeScript type derived from the schema
export type Customer = typeof CustomerSchema.Type
```

### 2. **Transform/Enforce Enum Values with Defaults**

When backend might return unknown enum values, create a transformation schema with fallback defaults:

```typescript
const CustomerStatusSchema = Schema.Literal('ACTIVE', 'ARCHIVED')
type CustomerStatus = typeof CustomerStatusSchema.Type

const TransformedCustomerStatusSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(CustomerStatusSchema),
  {
    decode: (input) => {
      // Validate the input and provide a safe default
      if (CustomerStatusSchema.literals.includes(input as CustomerStatus)) {
        return input as CustomerStatus
      }
      return 'ACTIVE'  // Safe fallback for unknown values
    },
    encode: input => input,
  },
)
```

### 3. **Use Schemas in API Hooks with `decodeUnknownPromise`**

In your SWR hooks, decode API responses using `Schema.decodeUnknownPromise`:

```typescript
// Example: src/features/customers/api/useListCustomers.ts
import { Schema } from 'effect'
import { CustomerSchema } from '../../../schemas/customer'

// Define the full API response schema
const ListCustomersRawResultSchema = Schema.Struct({
  data: Schema.Array(CustomerSchema),
  meta: Schema.Struct({
    pagination: Schema.Struct({
      cursor: Schema.NullOr(Schema.String),
      hasMore: pipe(
        Schema.propertySignature(Schema.Boolean),
        Schema.fromKey('has_more'),  // Transform has_more -> hasMore
      ),
    }),
  }),
})

export function useListCustomers({ query, isEnabled = true }) {
  const swrResponse = useSWRInfinite(
    // ... key loader ...
    ({ accessToken, apiUrl, businessId, cursor, query }) => 
      listCustomers(apiUrl, accessToken, { params: { /* ... */ } })()
        // This is the key line - decode the response
        .then(Schema.decodeUnknownPromise(ListCustomersRawResultSchema)),
    { /* ... options ... */ }
  )
  
  return new ListCustomersSWRResponse(swrResponse)
}
```

### 4. **Alternative: Use `decodeUnknownEither` for Custom Error Handling**

For more control over error handling, use `decodeUnknownEither`:

```typescript
export const decodeLedgerEntrySource = (data: unknown) => {
  const result = Schema.decodeUnknownEither(LedgerEntrySourceSchema)(data)
  
  if (result._tag === 'Left') {
    console.warn('Failed to decode ledger entry source:', result.left)
    return null  // Return null on validation failure
  }
  
  return result.right  // Return the validated data
}
```

## Key Patterns in Your Codebase

### ✅ **Field Name Transformation** (snake_case → camelCase)
```typescript
externalId: pipe(
  Schema.propertySignature(Schema.NullOr(Schema.String)),
  Schema.fromKey('external_id'),  // Backend uses snake_case
)
```

### ✅ **Enum Validation with Safe Defaults**
```typescript
const TransformedInvoiceStatusSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(InvoiceStatusSchema),
  {
    decode: (input) => {
      if (Object.values(InvoiceStatusSchema.enums).includes(input)) {
        return input as InvoiceStatus
      }
      return InvoiceStatus.Sent  // Safe default
    },
    encode: input => input,
  },
)
```

### ✅ **Type Extraction**
```typescript
export type Customer = typeof CustomerSchema.Type
```

### ✅ **Runtime Validation in API Calls**
```typescript
.then(Schema.decodeUnknownPromise(ResponseSchema))
```

## Benefits of This Approach

1. **Type Safety**: Automatic TypeScript types from schemas
2. **Runtime Validation**: Catches unexpected API changes at runtime
3. **Data Transformation**: Automatically converts snake_case to camelCase
4. **Safe Defaults**: Gracefully handles unknown enum values
5. **Single Source of Truth**: Schema defines both validation and types

## Complete Pattern: Building Hooks with Schemas

The **best practice pattern** in this codebase follows a two-file approach:

1. **Schema Definition** (`/src/schemas/*.ts`) - Defines the data structure and validation
2. **Hook Implementation** (`/src/hooks/*` or `/src/features/*/api/*`) - Uses the schema for type-safe API calls

This approach is ideal for **net new features** as it ensures strong typing from the start.

### Step 1: Define the Schema File

Create a comprehensive schema file that defines all data structures for your API resource:

```typescript
// src/schemas/callBookings.ts
import { Schema, pipe } from 'effect'

// 1. Define TypeScript enums for domain values
export enum CallBookingState {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

// 2. Define corresponding Schema.Literal for validation
const CallBookingStateSchema = Schema.Literal(
  'SCHEDULED',
  'CANCELLED',
  'COMPLETED',
)

// 3. Create transformation schemas with safe defaults
const TransformedCallBookingStateSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(CallBookingStateSchema),
  {
    decode: (input) => {
      if (CallBookingStateSchema.literals.includes(input as CallBookingState)) {
        return input as CallBookingState
      }
      return 'SCHEDULED' // Safe default for unknown backend values
    },
    encode: input => input,
  },
)

// 4. Define the main resource schema
export const CallBookingSchema = Schema.Struct({
  id: Schema.String,
  
  // Transform snake_case API fields to camelCase
  businessId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('business_id'),
  ),
  
  // Use transformed enum schema
  state: TransformedCallBookingStateSchema,
  
  callType: pipe(
    Schema.propertySignature(TransformedCallBookingTypeSchema),
    Schema.fromKey('call_type'),
  ),
  
  // Handle optional/nullable fields
  cancellationReason: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('cancellation_reason'),
  ),
  
  createdAt: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('created_at'),
  ),
})

// 5. Export TypeScript type from schema
export type CallBooking = typeof CallBookingSchema.Type

// 6. Define response schemas for list endpoints
export const ListCallBookingsResponseSchema = Schema.Struct({
  data: Schema.Array(CallBookingSchema),
  meta: Schema.Struct({
    pagination: Schema.Struct({
      cursor: Schema.NullOr(Schema.String).pipe(Schema.optional),
      hasMore: pipe(
        Schema.propertySignature(Schema.Boolean),
        Schema.fromKey('has_more'),
      ),
    }),
  }),
})

export type ListCallBookingsResponse = typeof ListCallBookingsResponseSchema.Type

// 7. Define response schemas for single-item endpoints (create/update/get)
export const CallBookingItemResponseSchema = Schema.Struct({
  data: CallBookingSchema,
})
```

### Step 2: Build the Hook Using the Schema

Create your SWR hook that leverages the schema for runtime validation:

```typescript
// src/hooks/useCallBookings/useCallBookings.tsx
import useSWRInfinite from 'swr/infinite'
import useSWRMutation from 'swr/mutation'
import { Schema } from 'effect'
import { get, post } from '../../api/layer/authenticated_http'
import {
  CallBookingState,
  CallBookingType,
  CallBookingPurpose,
  CallBookingItemResponseSchema,
  ListCallBookingsResponseSchema,
} from '../../schemas/callBookings'
import type { CallBooking, ListCallBookingsResponse } from '../../schemas/callBookings'

// Re-export types and enums for consumers
export type { CallBooking }
export { CallBookingState, CallBookingType, CallBookingPurpose }

// Define API endpoint builders
const listCallBookings = get<Record<string, unknown>, ListCallBookingsParams>(
  ({ businessId, cursor, limit }) => {
    const parameters = toDefinedSearchParameters({ cursor, limit })
    return `/v1/businesses/${businessId}/call-bookings?${parameters}`
  }
)

// Define request body types (use snake_case to match backend)
// The request body can also be a schema
type CreateCallBookingBody = {
  external_id: string
  purpose: CallBookingPurpose
  call_type: CallBookingType
  event_start_at?: string
  location?: string
  cancellation_reason?: string
}

const createCallBooking = post<
  Record<string, unknown>,
  CreateCallBookingBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/call-bookings`)

// ✅ Key Pattern: Use Schema.decodeUnknownPromise for runtime validation
export function useCallBookings({ isEnabled = true }: UseCallBookingsParams = {}) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData) => keyLoader(previousPageData, { ...auth, businessId, isEnabled }),
    ({ accessToken, apiUrl, businessId, cursor }) => 
      listCallBookings(apiUrl, accessToken, {
        params: { businessId, cursor, limit: 5 },
      })()
        // 🎯 This line does all the magic: validates and transforms the response
        .then(Schema.decodeUnknownPromise(ListCallBookingsResponseSchema)),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  return new ListCallBookingsSWRResponse(swrResponse)
}

// ✅ For mutation hooks, validate both the response
export function useCreateCallBooking() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => buildCreateKey({ ...data, businessId }),
    ({ accessToken, apiUrl, businessId }, { arg: body }) =>
      createCallBooking(apiUrl, accessToken, {
        params: { businessId },
        body,
      })
        // 🎯 Validate the create response (single item)
        .then(Schema.decodeUnknownPromise(CallBookingItemResponseSchema))
        .then(({ data }) => data),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  // ... trigger proxying for cache invalidation ...

  return mutationResponse
}
```

## Best Practices Summary

### ✅ **DO: Follow This Pattern for Net New Features**

1. **Schema First**: Define schemas before writing hooks
2. **Co-locate Enums**: Export both TypeScript enums and Schema literals from the same file
3. **Transform on Decode**: Use `Schema.transform` for enum validation with safe defaults
4. **Field Transformation**: Always use `Schema.fromKey` to convert `snake_case` → `camelCase`
5. **Type Safety**: Export TypeScript types derived from schemas (`typeof Schema.Type`)
6. **Response Validation**: Always decode API responses with `Schema.decodeUnknownPromise`
7. **Multiple Response Schemas**: Create separate schemas for list vs. single-item responses

### ✅ **Key Architecture Decisions**

| Aspect | Implementation | Rationale |
|--------|---------------|-----------|
| **Enum Handling** | TypeScript enum + Schema.Literal + Transform | Frontend uses enums, schema validates, transform provides safe defaults |
| **Field Naming** | `Schema.fromKey('snake_case')` | Backend uses snake_case, frontend uses camelCase |
| **Validation Timing** | Runtime via `.then(Schema.decodeUnknownPromise(...))` | Catches API contract changes immediately |
| **Type Derivation** | `typeof Schema.Type` | Single source of truth for both validation and types |
| **Response Wrappers** | Separate schemas for `{ data: T }` and `{ data: T[], meta: ... }` | Matches backend API envelope patterns |

### ⚠️ **Current Limitations**

**Missing: Testing Infrastructure**

While this pattern provides excellent type safety and runtime validation, the codebase currently **lacks automated testing** to verify that:

- Schema definitions match actual backend API contracts
- Enum values are complete and up-to-date
- Field transformations are correct
- Safe default values are appropriate

**Recommendations for future work:**
- Add integration tests that validate schemas against real API responses
- Create contract tests using tools like Pact or OpenAPI validation
- Set up CI checks to detect schema drift from backend
- Add unit tests for transformation schemas with edge cases

### 📊 **When to Use This Pattern**

| Scenario | Use Schema Pattern? | Reason |
|----------|-------------------|---------|
| **Net new feature** | ✅ Yes | Start with strong typing from day one |
| **Backend contract exists** | ✅ Yes | Prevent runtime errors from API changes |
| **Complex transformations** | ✅ Yes | Schema handles enum defaults, field mapping |
| **Existing hook refactor** | ⚠️ Maybe | Weigh effort vs. benefit; prioritize high-traffic endpoints |
| **Internal-only types** | ❌ No | Simple TypeScript interfaces may suffice |