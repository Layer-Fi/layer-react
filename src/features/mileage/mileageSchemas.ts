import { Schema, pipe } from 'effect'

export const MileageMonthSchema = Schema.Struct({
  month: Schema.Number,

  miles: Schema.Number,

  businessMiles: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('business_miles'),
  ),

  personalMiles: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('personal_miles'),
  ),

  uncategorizedMiles: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('uncategorized_miles'),
  ),

  estimatedDeduction: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('estimated_deduction'),
  ),

  trips: Schema.Number,

  businessTrips: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('business_trips'),
  ),

  personalTrips: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('personal_trips'),
  ),

  uncategorizedTrips: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('uncategorized_trips'),
  ),

  deductionRate: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('deduction_rate'),
  ),
})
export type MileageMonth = typeof MileageMonthSchema.Type

export const MileageYearSchema = Schema.Struct({
  year: Schema.Number,

  miles: Schema.Number,

  businessMiles: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('business_miles'),
  ),

  personalMiles: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('personal_miles'),
  ),

  uncategorizedMiles: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('uncategorized_miles'),
  ),

  estimatedDeduction: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('estimated_deduction'),
  ),

  trips: Schema.Number,

  businessTrips: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('business_trips'),
  ),

  personalTrips: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('personal_trips'),
  ),

  uncategorizedTrips: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('uncategorized_trips'),
  ),

  months: Schema.Array(MileageMonthSchema),
})
export type MileageYear = typeof MileageYearSchema.Type

export const MileageSummarySchema = Schema.Struct({
  years: Schema.Array(MileageYearSchema),
})
export type MileageSummary = typeof MileageSummarySchema.Type

