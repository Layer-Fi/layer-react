import { pipe, Schema } from 'effect'

const TaxPaymentQuarterSchema = Schema.Struct({
  quarter: Schema.Number,
  owedRolledOverFromPrevious: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('owed_rolled_over_from_previous'),
  ),
  owedThisQuarter: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('owed_this_quarter'),
  ),
  totalPaid: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_paid'),
  ),
  total: Schema.Number,
})

export type TaxPaymentQuarter = typeof TaxPaymentQuarterSchema.Type

const TaxPaymentsSchema = Schema.Struct({
  year: Schema.Number,
  quarters: Schema.Array(TaxPaymentQuarterSchema),
})

export type TaxPayments = typeof TaxPaymentsSchema.Type

export const TaxPaymentsResponseSchema = Schema.Struct({
  data: TaxPaymentsSchema,
})

export type TaxPaymentsResponse = typeof TaxPaymentsResponseSchema.Type
