import { pipe, Schema } from 'effect'

import { type TaxSummarySectionType } from './summary'

const TaxOverviewSectionTypeSchema = Schema.Literal('federal', 'state')

export type TaxOverviewSectionType = typeof TaxOverviewSectionTypeSchema.Type

const TaxOverviewLineItemVariantSchema = Schema.Literal('regular', 'subtle', 'subtotal')

export type TaxOverviewLineItemVariant = typeof TaxOverviewLineItemVariantSchema.Type

const TaxOverviewLineItemSchema = Schema.Struct({
  label: Schema.String,
  amount: Schema.NullishOr(Schema.Number),
  variant: TaxOverviewLineItemVariantSchema,
})

export type TaxOverviewLineItem = typeof TaxOverviewLineItemSchema.Type

const TaxOverviewSectionSchema = Schema.Struct({
  type: TaxOverviewSectionTypeSchema,
  label: Schema.String,
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(TaxOverviewLineItemSchema)),
    Schema.fromKey('line_items'),
  ),
})

export type TaxOverviewSection = typeof TaxOverviewSectionSchema.Type

const TaxOverviewApiDataSchema = Schema.Struct({
  year: Schema.Number,
  totalTaxesOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_taxes_owed'),
  ),
  taxSections: pipe(
    Schema.propertySignature(Schema.Array(TaxOverviewSectionSchema)),
    Schema.fromKey('tax_sections'),
  ),
})

export type TaxOverviewApiData = typeof TaxOverviewApiDataSchema.Type

export const TaxOverviewApiResponseSchema = Schema.Struct({
  data: TaxOverviewApiDataSchema,
})

export type TaxOverviewApiResponse = typeof TaxOverviewApiResponseSchema.Type

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
