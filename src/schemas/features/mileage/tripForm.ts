import { Schema } from 'effect'

import { CalendarDateFromSelf } from '@schemas/common/calendarDateFromSelf'
import { NonRecursiveBigDecimalSchema } from '@schemas/common/nonRecursiveBigDecimal'
import { TripPurposeSchema } from '@schemas/features/mileage/trip'
import { VehicleSchema } from '@schemas/features/mileage/vehicle'

export const TripPlaceSchema = Schema.Struct({
  placeId: Schema.String,
  latitude: Schema.NullishOr(Schema.String),
  longitude: Schema.NullishOr(Schema.String),
})

export type TripPlace = typeof TripPlaceSchema.Type

export const TripFormAddressSchema = Schema.Struct({
  address: Schema.String,
  place: Schema.NullOr(TripPlaceSchema),
})

export type TripFormAddress = typeof TripFormAddressSchema.Type

export const TripFormSchema = Schema.Struct({
  vehicle: Schema.NullOr(VehicleSchema),
  tripDate: Schema.NullOr(CalendarDateFromSelf),
  distance: Schema.NullOr(NonRecursiveBigDecimalSchema),
  purpose: TripPurposeSchema,
  start: TripFormAddressSchema,
  end: TripFormAddressSchema,
  description: Schema.String,
})

export type TripForm = typeof TripFormSchema.Type
