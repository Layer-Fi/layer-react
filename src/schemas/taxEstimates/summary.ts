import { pipe, Schema } from 'effect'

const TaxSummarySectionSchema = Schema.Struct({
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
  type: Schema.Literal('Tax_Summary'),
  year: Schema.Number,
  projectedTaxesOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('projected_taxes_owed'),
  ),
  taxesDueAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('taxes_due_at'),
  ),
  sections: Schema.Array(TaxSummarySectionSchema),
})

export type TaxSummary = typeof TaxSummarySchema.Type

export const TaxSummaryResponseSchema = Schema.Struct({
  data: TaxSummarySchema,
})

export type TaxSummaryResponse = typeof TaxSummaryResponseSchema.Type
