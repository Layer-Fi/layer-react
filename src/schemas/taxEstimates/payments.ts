import { pipe, Schema } from 'effect'

const jurisdictionFields = {
  usFederal: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('us_federal'),
  ),
  usState: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('us_state'),
  ),
}

const TaxOwedBreakdownSchema = Schema.Struct({
  ...jurisdictionFields,
})

export type TaxOwedBreakdown = typeof TaxOwedBreakdownSchema.Type

const TaxPaidBreakdownSchema = Schema.Struct({
  ...jurisdictionFields,
  uncategorized: Schema.Number,
})

export type TaxPaidBreakdown = typeof TaxPaidBreakdownSchema.Type

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
  owedThisQuarterBreakdown: pipe(
    Schema.propertySignature(TaxOwedBreakdownSchema),
    Schema.fromKey('owed_this_quarter_breakdown'),
  ),
  totalPaid: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_paid'),
  ),
  totalPaidBreakdown: pipe(
    Schema.propertySignature(TaxPaidBreakdownSchema),
    Schema.fromKey('total_paid_breakdown'),
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
