import { pipe, Schema } from 'effect'

const TaxSummarySectionTypeSchema = Schema.Literal('federal', 'state')

export type TaxSummarySectionType = typeof TaxSummarySectionTypeSchema.Type

const TaxSummarySectionSchema = Schema.Struct({
  type: TaxSummarySectionTypeSchema,
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

export type TaxSummaryApiData = typeof TaxSummarySchema.Type
