import { Schema, pipe } from 'effect'
export { BookkeepingStatus } from '../hooks/bookkeeping/useBookkeepingStatus'

export enum TransactionTaggingStrategy {
  PC_MSO = 'PC_MSO',
}

const BookkeepingStatusSchema = Schema.Literal(
  'NOT_PURCHASED',
  'ONBOARDING',
  'BOOKKEEPING_PAUSED',
  'ACTIVE',
)

const TransactionTaggingStrategySchema = Schema.Literal(
  'PC_MSO',
)

const TransformedBookkeepingStatusSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(BookkeepingStatusSchema),
  {
    decode: (input: string) => {
      if (BookkeepingStatusSchema.literals.includes(input as typeof BookkeepingStatusSchema.Type)) {
        return input as typeof BookkeepingStatusSchema.Type
      }
      return 'NOT_PURCHASED'
    },
    encode: input => input,
  },
)

const TransformedTransactionTaggingStrategySchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(TransactionTaggingStrategySchema),
  {
    decode: (input: string) => {
      if (TransactionTaggingStrategySchema.literals.includes(input as typeof TransactionTaggingStrategySchema.Type)) {
        return input as typeof TransactionTaggingStrategySchema.Type
      }
      return 'PC_MSO'
    },
    encode: input => input,
  },
)

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

export type BookkeepingConfiguration = typeof BookkeepingConfigurationSchema.Type

export const BookkeepingConfigurationResponseSchema = Schema.Struct({
  data: BookkeepingConfigurationSchema,
})

export type BookkeepingConfigurationResponse = typeof BookkeepingConfigurationResponseSchema.Type
