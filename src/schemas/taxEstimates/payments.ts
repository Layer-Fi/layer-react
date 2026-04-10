import { pipe, Schema } from 'effect'

const taxPaymentBreakdownFields = {
  rowKey: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('row_key'),
  ),
  label: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('label'),
  ),
  rolledOverFromPrevious: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('rolled_over_from_previous'),
  ),
  owedThisQuarter: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('owed_this_quarter'),
  ),
  totalPaid: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_paid'),
  ),
  remainingBalance: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('remaining_balance'),
  ),
}

export interface TaxPaymentBreakdown extends Schema.Struct.Type<typeof taxPaymentBreakdownFields> {
  breakdown?: ReadonlyArray<TaxPaymentBreakdown>
}

export interface TaxPaymentBreakdownEncoded extends Schema.Struct.Encoded<typeof taxPaymentBreakdownFields> {
  readonly breakdown?: ReadonlyArray<TaxPaymentBreakdownEncoded>
}

const TaxPaymentsRowSchema = Schema.Struct({
  ...taxPaymentBreakdownFields,
  breakdown: Schema.optional(
    Schema.Array(
      Schema.suspend((): Schema.Schema<TaxPaymentBreakdown, TaxPaymentBreakdownEncoded> => TaxPaymentsRowSchema),
    ),
  ),
})

export type TaxPaymentRow = typeof TaxPaymentsRowSchema.Type

export const TaxPaymentsResponseSchema = Schema.Struct({
  data: Schema.Struct({
    type: Schema.Literal('US_Tax_Payments'),
    data: Schema.Array(TaxPaymentsRowSchema),
  }),
})

export type TaxPaymentsResponse = typeof TaxPaymentsResponseSchema.Type
