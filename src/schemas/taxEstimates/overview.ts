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

export type TaxOverviewCategoryKey = 'federal' | 'state'

export type TaxOverviewDeadlineStatusKind = 'pastDue' | 'paid' | 'due' | 'categorizationIncomplete'

export type TaxOverviewDeadlineStatus = {
  kind: TaxOverviewDeadlineStatusKind
}

export type TaxOverviewDeadlineReview = {
  payload: {
    type: 'UNCATEGORIZED_TRANSACTIONS'
    count: number
    amount: number
  }
}

export type TaxOverviewDeadline = {
  amount: number
  description: string
  dueAt: Date
  id: string
  reviewAction?: TaxOverviewDeadlineReview
  status?: TaxOverviewDeadlineStatus
  title: string
}
export type TaxOverviewCategory = {
  amount: number
  key: TaxSummarySectionType
  label: string
}
