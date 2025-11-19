import { pipe, Schema } from 'effect'

// Schema that converts dollar string to cents (number)
// e.g., "79683.8000" -> 7968380
const DollarStringToCentsSchema = Schema.transform(
  Schema.NumberFromString,
  Schema.Number,
  {
    strict: true,
    decode: dollars => Math.round(dollars * 100),
    encode: cents => cents / 100,
  },
)

export const MileageMonthSchema = Schema.Struct({
  month: Schema.Number,

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
    Schema.propertySignature(DollarStringToCentsSchema),
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
    Schema.propertySignature(Schema.NumberFromString),
    Schema.fromKey('deduction_rate'),
  ),
})
export type MileageMonth = typeof MileageMonthSchema.Type

export const MileageYearSchema = Schema.Struct({
  year: Schema.Number,

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
    Schema.propertySignature(DollarStringToCentsSchema),
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
