import { pipe, Schema } from 'effect'

import { createTransformedEnumSchema } from '@schemas/utils'

import { type TaxSummarySectionType } from './summary'

export enum TaxOverviewMetricType {
  TotalIncome = 'TOTAL_INCOME',
  TotalPreAgiDeductions = 'TOTAL_PRE_AGI_DEDUCTIONS',
  TaxableIncome = 'TAXABLE_INCOME',
  UnknownType = 'UNKNOWN_TYPE',
}

const TaxOverviewMetricTypeSchema = createTransformedEnumSchema(
  Schema.Enums(TaxOverviewMetricType),
  TaxOverviewMetricType,
  TaxOverviewMetricType.UnknownType,
)

export type TaxOverviewMetricTypeValue = typeof TaxOverviewMetricTypeSchema.Type

const TaxOverviewMetricSchema = Schema.Struct({
  value: Schema.Number,
  maxValue: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('max_value'),
  ),
  label: Schema.String,
  metricType: pipe(
    Schema.propertySignature(TaxOverviewMetricTypeSchema),
    Schema.fromKey('metric_type'),
  ),
})

export type TaxOverviewMetric = typeof TaxOverviewMetricSchema.Type

const TaxOverviewApiDataSchema = Schema.Struct({
  year: Schema.Number,
  metrics: Schema.Array(TaxOverviewMetricSchema),
})

export type TaxOverviewApiData = typeof TaxOverviewApiDataSchema.Type

export const TaxOverviewApiResponseSchema = Schema.Struct({
  data: TaxOverviewApiDataSchema,
})

export type TaxOverviewApiResponse = typeof TaxOverviewApiResponseSchema.Type

export type TaxOverviewBannerReview = {
  amount: number
  count: number
  type: 'UNCATEGORIZED_TRANSACTIONS'
}

export enum TaxOverviewDeadlineStatus {
  PastDue = 'PAST_DUE',
  Paid = 'PAID',
  Due = 'DUE',
  CategorizationIncomplete = 'CATEGORIZATION_INCOMPLETE',
  Neutral = 'NEUTRAL',
}

export type TaxOverviewCategory = {
  amount: number
  key: TaxSummarySectionType
  label: string
}
