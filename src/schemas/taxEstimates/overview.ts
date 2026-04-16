import { pipe, Schema } from 'effect'

export enum TaxOverviewMetricType {
  TotalIncome = 'TOTAL_INCOME',
  TotalPreAgiDeductions = 'TOTAL_PRE_AGI_DEDUCTIONS',
  TaxableIncome = 'TAXABLE_INCOME',
}

const TaxOverviewMetricTypeSchema = Schema.Enums(TaxOverviewMetricType)

const TransformedTaxOverviewMetricTypeSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(TaxOverviewMetricTypeSchema),
  {
    decode: (input) => {
      if (Object.values(TaxOverviewMetricTypeSchema.enums).includes(input as TaxOverviewMetricType)) {
        return input as TaxOverviewMetricType
      }
      return TaxOverviewMetricType.TotalIncome
    },
    encode: input => input,
  },
)

export type TaxOverviewMetricTypeValue = typeof TransformedTaxOverviewMetricTypeSchema.Type

const TaxOverviewMetricSchema = Schema.Struct({
  value: Schema.Number,
  maxValue: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('max_value'),
  ),
  label: Schema.String,
  metricType: pipe(
    Schema.propertySignature(TransformedTaxOverviewMetricTypeSchema),
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
