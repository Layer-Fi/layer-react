import { pipe, Schema } from 'effect'

const MileageStatsFields = {
  miles: Schema.NumberFromString,

  businessMiles: pipe(
    Schema.propertySignature(Schema.NumberFromString),
    Schema.fromKey('business_miles'),
  ),

  personalMiles: pipe(
    Schema.propertySignature(Schema.NumberFromString),
    Schema.fromKey('personal_miles'),
  ),

  uncategorizedMiles: pipe(
    Schema.propertySignature(Schema.NumberFromString),
    Schema.fromKey('uncategorized_miles'),
  ),

  estimatedDeduction: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('estimated_deduction'),
  ),

  trips: Schema.Int,

  businessTrips: pipe(
    Schema.propertySignature(Schema.Int),
    Schema.fromKey('business_trips'),
  ),

  personalTrips: pipe(
    Schema.propertySignature(Schema.Int),
    Schema.fromKey('personal_trips'),
  ),

  uncategorizedTrips: pipe(
    Schema.propertySignature(Schema.Int),
    Schema.fromKey('uncategorized_trips'),
  ),
}

export const MileageMonthSchema = Schema.Struct({
  month: Schema.Int,
  ...MileageStatsFields,
  deductionRate: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('deduction_rate'),
  ),
})
export type MileageMonth = typeof MileageMonthSchema.Type

export const MileageYearSchema = Schema.Struct({
  year: Schema.Number,
  ...MileageStatsFields,
  months: Schema.Array(MileageMonthSchema),
})
export type MileageYear = typeof MileageYearSchema.Type

export const MileageSummarySchema = Schema.Struct({
  years: Schema.Array(MileageYearSchema),
})
export type MileageSummary = typeof MileageSummarySchema.Type
