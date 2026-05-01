import { pipe, Schema } from 'effect'

export type TaxDetailsRowOperator = '+' | '-' | '×'

export type TaxDetailsRow = {
  rowKey: string
  label: string
  amount?: number
  rate?: number
  operator?: TaxDetailsRowOperator
  breakdown?: ReadonlyArray<TaxDetailsRow>
}

type TaxDetailsRowEncoded = {
  row_key: string
  label: string
  amount?: number
  rate?: number
  operator?: TaxDetailsRowOperator
  breakdown?: ReadonlyArray<TaxDetailsRowEncoded>
}

const TaxDetailsRowOperatorSchema = Schema.Literal('+', '-', '×')

const TaxDetailsRowSchema: Schema.Schema<
  TaxDetailsRow,
  TaxDetailsRowEncoded
> = Schema.suspend(() =>
  Schema.Struct({
    rowKey: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('row_key'),
    ),
    label: Schema.String,
    amount: Schema.optional(Schema.Number),
    rate: Schema.optional(Schema.Number),
    operator: Schema.optional(TaxDetailsRowOperatorSchema),
    breakdown: Schema.optional(Schema.Array(TaxDetailsRowSchema)),
  }),
)

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
