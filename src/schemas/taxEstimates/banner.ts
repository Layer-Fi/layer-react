import { pipe, Schema } from 'effect'

import { CalendarDateSchema } from '@schemas/common/calendarDateFromSelf'
import { TaxOverviewDeadlineStatus } from '@schemas/taxEstimates/overview'
import { createTransformedEnumSchema, UnwrappedDataResponseSchema } from '@schemas/utils'

const TransformedTaxOverviewDeadlineStatusSchema = createTransformedEnumSchema(
  Schema.Enums(TaxOverviewDeadlineStatus),
  TaxOverviewDeadlineStatus,
  TaxOverviewDeadlineStatus.Neutral,
)

const TaxEstimatesBannerQuarterSchema = Schema.Struct({
  quarter: Schema.Number,
  dueDate: pipe(
    Schema.propertySignature(CalendarDateSchema),
    Schema.fromKey('due_date'),
  ),
  isPastDue: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_past_due'),
  ),
  amountOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('amount_owed'),
  ),
  state: pipe(
    Schema.propertySignature(TransformedTaxOverviewDeadlineStatusSchema),
    Schema.fromKey('state'),
  ),
  amountPaid: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('amount_paid'),
  ),
  balance: Schema.Number,
  uncategorizedCount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('uncategorized_count'),
  ),
  uncategorizedMoneyIn: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('uncategorized_money_in'),
  ),
  uncategorizedMoneyOut: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('uncategorized_money_out'),
  ),
  earliestUncategorizedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('earliest_uncategorized_at'),
  ),
  latestUncategorizedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('latest_uncategorized_at'),
  ),
})

export type TaxEstimatesBannerQuarter = typeof TaxEstimatesBannerQuarterSchema.Type

const TaxEstimatesBannerSchema = Schema.Struct({
  year: Schema.Number,
  taxesDueAt: pipe(
    Schema.propertySignature(CalendarDateSchema),
    Schema.fromKey('taxes_due_at'),
  ),
  totalTaxesOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_taxes_owed'),
  ),
  totalUncategorizedCount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_uncategorized_count'),
  ),
  totalUncategorizedMoneyIn: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_uncategorized_money_in'),
  ),
  totalUncategorizedMoneyOut: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_uncategorized_money_out'),
  ),
  earliestUncategorizedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('earliest_uncategorized_at'),
  ),
  latestUncategorizedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('latest_uncategorized_at'),
  ),
  quarters: Schema.Array(TaxEstimatesBannerQuarterSchema),
})

export type TaxEstimatesBanner = typeof TaxEstimatesBannerSchema.Type

export const TaxEstimatesBannerResponseSchema = UnwrappedDataResponseSchema(TaxEstimatesBannerSchema)

export type TaxEstimatesBannerResponse = typeof TaxEstimatesBannerResponseSchema.Type
