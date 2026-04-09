import { pipe, Schema } from 'effect'

const JurisdictionBreakdownSchema = Schema.Struct({
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
})

export type JurisdictionBreakdown = typeof JurisdictionBreakdownSchema.Type

const TaxBreakdownSchema = Schema.Struct({
  federal: JurisdictionBreakdownSchema,
  state: JurisdictionBreakdownSchema,
  uncategorized: Schema.optional(JurisdictionBreakdownSchema),
})

export type TaxBreakdown = typeof TaxBreakdownSchema.Type

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
  breakdown: TaxBreakdownSchema,
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
