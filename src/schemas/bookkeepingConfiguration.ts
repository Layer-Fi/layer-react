import { Schema, pipe } from 'effect'
import { createTransformedEnumSchema } from './utils'

export enum TransactionTaggingStrategy {
  PC_MSO = 'PC_MSO',
}

export enum BookkeepingStatus {
  NOT_PURCHASED = 'NOT_PURCHASED',
  ONBOARDING = 'ONBOARDING',
  BOOKKEEPING_PAUSED = 'BOOKKEEPING_PAUSED',
  ACTIVE = 'ACTIVE',
}

const BookkeepingStatusSchema = Schema.Enums(BookkeepingStatus)
const TransactionTaggingStrategySchema = Schema.Enums(TransactionTaggingStrategy)

const TransformedBookkeepingStatusSchema = createTransformedEnumSchema(BookkeepingStatusSchema, BookkeepingStatus, BookkeepingStatus.NOT_PURCHASED)
const TransformedTransactionTaggingStrategySchema = createTransformedEnumSchema(
  TransactionTaggingStrategySchema,
  TransactionTaggingStrategy,
  TransactionTaggingStrategy.PC_MSO,
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
