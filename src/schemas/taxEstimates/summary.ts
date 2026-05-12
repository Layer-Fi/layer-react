import { pipe, Schema } from 'effect'

import { createTransformedEnumSchema } from '@schemas/utils'

const TaxSummarySectionTypeSchema = Schema.Literal('federal', 'state')

export enum TaxSummaryState {
  NO_TRANSACTIONS = 'NO_TRANSACTIONS',
  NEGATIVE_TAXES_OWED = 'NEGATIVE_TAXES_OWED',
  ZERO_OR_POSITIVE_TAXES_OWED = 'ZERO_OR_POSITIVE_TAXES_OWED',
  UNKNOWN = 'UNKNOWN',
}

export const TransformedTaxSummaryStateSchema = createTransformedEnumSchema(
  Schema.Enums(TaxSummaryState),
  TaxSummaryState,
  TaxSummaryState.UNKNOWN,
)

export type TaxSummarySectionType = typeof TaxSummarySectionTypeSchema.Type

const TaxSummarySectionSchema = Schema.Struct({
  type: TaxSummarySectionTypeSchema,
  key: Schema.NullishOr(Schema.String),
  label: Schema.String,
  total: Schema.Number,
  taxesPaid: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxes_paid'),
  ),
  taxesOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxes_owed'),
  ),
})

export type TaxSummarySection = typeof TaxSummarySectionSchema.Type

const TaxSummarySchema = Schema.Struct({
  year: Schema.Number,
  state: Schema.NullishOr(TransformedTaxSummaryStateSchema),
  projectedTaxesOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('projected_taxes_owed'),
  ),
  taxesDueAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('taxes_due_at'),
  ),
  uncategorizedTaxPayments: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('uncategorized_tax_payments'),
  ),
  sections: Schema.Array(TaxSummarySectionSchema),
})

export type TaxSummary = typeof TaxSummarySchema.Type

export const TaxSummaryResponseSchema = Schema.Struct({
  data: TaxSummarySchema,
})

export type TaxSummaryResponse = typeof TaxSummaryResponseSchema.Type
