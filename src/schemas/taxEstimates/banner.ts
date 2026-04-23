import { pipe, Schema } from 'effect'

import { CalendarDateSchema } from '@schemas/common/calendarDateFromSelf'
import { TaxOverviewDeadlineStatus } from '@schemas/taxEstimates/overview'
import { createTransformedEnumSchema } from '@schemas/utils'

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
  uncategorizedSum: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('uncategorized_sum'),
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
  totalUncategorizedSum: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_uncategorized_sum'),
  ),
  quarters: Schema.Array(TaxEstimatesBannerQuarterSchema),
})

export type TaxEstimatesBanner = typeof TaxEstimatesBannerSchema.Type

export const TaxEstimatesBannerResponseSchema = Schema.Struct({
  data: TaxEstimatesBannerSchema,
})

export type TaxEstimatesBannerResponse = typeof TaxEstimatesBannerResponseSchema.Type
