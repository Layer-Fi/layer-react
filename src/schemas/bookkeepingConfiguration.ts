import { Schema, pipe } from 'effect'

// Re-export BookkeepingStatus from existing hook
// This enum is already defined in src/hooks/bookkeeping/useBookkeepingStatus.ts
export { BookkeepingStatus } from '../hooks/bookkeeping/useBookkeepingStatus'

/**
 * TransactionTaggingStrategy enum defines how transactions are tagged for bookkeeping
 * PC_MSO = Professional Cloud - Managed Service Organization
 */
export enum TransactionTaggingStrategy {
  PC_MSO = 'PC_MSO',
}

// Define Schema.Literal for BookkeepingStatus validation
const BookkeepingStatusSchema = Schema.Literal(
  'NOT_PURCHASED',
  'ONBOARDING',
  'BOOKKEEPING_PAUSED',
  'ACTIVE',
)

// Define Schema.Literal for TransactionTaggingStrategy validation
const TransactionTaggingStrategySchema = Schema.Literal(
  'PC_MSO',
)

// Create transformation schema for BookkeepingStatus with safe default
const TransformedBookkeepingStatusSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(BookkeepingStatusSchema),
  {
    decode: (input: string) => {
      if (BookkeepingStatusSchema.literals.includes(input as typeof BookkeepingStatusSchema.Type)) {
        return input as typeof BookkeepingStatusSchema.Type
      }
      // Safe default for unknown backend values
      return 'NOT_PURCHASED'
    },
    encode: input => input,
  },
)

// Create transformation schema for TransactionTaggingStrategy with safe default
const TransformedTransactionTaggingStrategySchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(TransactionTaggingStrategySchema),
  {
    decode: (input: string) => {
      if (TransactionTaggingStrategySchema.literals.includes(input as typeof TransactionTaggingStrategySchema.Type)) {
        return input as typeof TransactionTaggingStrategySchema.Type
      }
      // Safe default for unknown backend values
      return 'PC_MSO'
    },
    encode: input => input,
  },
)

/**
 * Schema for business bookkeeping configuration
 * Matches the backend ApiBusinessBookkeepingConfiguration data class
 */
export const BookkeepingConfigurationSchema = Schema.Struct({
  businessId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('business_id'),
  ),

  bookkeeperId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('bookkeeper_id'),
  ),

  firstMonthPurchasedDate: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('first_month_purchased_date'),
  ),

  onboardingDate: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('onboarding_date'),
  ),

  churnedDate: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('churned_date'),
  ),

  bookkeepingEndDate: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('bookkeeping_end_date'),
  ),

  bookkeepingStatus: pipe(
    Schema.propertySignature(TransformedBookkeepingStatusSchema),
    Schema.fromKey('bookkeeping_status'),
  ),

  transactionTaggingStrategy: pipe(
    Schema.propertySignature(Schema.NullOr(TransformedTransactionTaggingStrategySchema)),
    Schema.fromKey('transaction_tagging_strategy'),
  ),

  notes: Schema.NullOr(Schema.String),

  onboardingCallUrl: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('onboarding_call_url'),
  ),

  adhocCallUrl: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('adhoc_call_url'),
  ),
})

// Export TypeScript type derived from schema
export type BookkeepingConfiguration = typeof BookkeepingConfigurationSchema.Type

/**
 * Response schema for the single-item endpoint
 * GET /v1/businesses/:businessId/bookkeeping-config
 */
export const BookkeepingConfigurationResponseSchema = Schema.Struct({
  data: BookkeepingConfigurationSchema,
})

export type BookkeepingConfigurationResponse = typeof BookkeepingConfigurationResponseSchema.Type
