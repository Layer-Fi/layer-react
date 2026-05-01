import { pipe, Schema } from 'effect'

import {
  UnifiedCellValueCurrencySchema,
  UnifiedCellValueDecimalSchema,
  UnifiedCellValuePercentageSchema,
} from '@schemas/reports/unifiedReport'

const TaxDetailsValueSchema = Schema.Union(
  UnifiedCellValueCurrencySchema,
  UnifiedCellValueDecimalSchema,
  UnifiedCellValuePercentageSchema,
)

export type TaxDetailsValue = typeof TaxDetailsValueSchema.Type

const taxDetailsRowFields = {
  rowKey: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('row_key'),
  ),
  label: Schema.String,
  value: Schema.optional(TaxDetailsValueSchema),
  operator: Schema.optional(Schema.String),
}

export interface TaxDetailsRow extends Schema.Struct.Type<typeof taxDetailsRowFields> {
  breakdown?: ReadonlyArray<TaxDetailsRow>
}

interface TaxDetailsRowEncoded extends Schema.Struct.Encoded<typeof taxDetailsRowFields> {
  readonly breakdown?: ReadonlyArray<TaxDetailsRowEncoded>
}

const TaxDetailsRowSchema = Schema.Struct({
  ...taxDetailsRowFields,
  breakdown: Schema.optional(
    Schema.Array(
      Schema.suspend((): Schema.Schema<TaxDetailsRow, TaxDetailsRowEncoded> => TaxDetailsRowSchema),
    ),
  ),
})

const TaxDetailsMetaSchema = Schema.Struct({
  year: Schema.Number,
  filingStatus: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('filing_status'),
  ),
})

export type TaxDetailsMeta = typeof TaxDetailsMetaSchema.Type

const TaxDetailsSchema = Schema.Struct({
  type: Schema.String,
  meta: TaxDetailsMetaSchema,
  rows: Schema.Array(TaxDetailsRowSchema),
})

export type TaxDetails = typeof TaxDetailsSchema.Type

export const TaxDetailsResponseSchema = Schema.Struct({
  data: TaxDetailsSchema,
})

export type TaxDetailsResponse = typeof TaxDetailsResponseSchema.Type
