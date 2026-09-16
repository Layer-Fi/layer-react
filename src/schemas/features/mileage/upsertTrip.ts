import { pipe, Schema } from 'effect'

import { CalendarDateSchema } from '@schemas/common/calendarDateFromSelf'

export const UpsertTripSchema = Schema.Struct({
  vehicleId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('vehicle_id'),
  ),
  tripDate: pipe(
    Schema.propertySignature(CalendarDateSchema),
    Schema.fromKey('trip_date'),
  ),
  distance: Schema.BigDecimal,
  purpose: Schema.String,
  startAddress: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('start_address'),
  ),
  endAddress: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('end_address'),
  ),
  googleStartPlaceId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('google_start_place_id'),
  ),
  googleEndPlaceId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('google_end_place_id'),
  ),
  startLatitude: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('start_latitude'),
  ),
  startLongitude: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('start_longitude'),
  ),
  endLatitude: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('end_latitude'),
  ),
  endLongitude: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('end_longitude'),
  ),
  description: Schema.NullishOr(Schema.String),
})

export type UpsertTrip = typeof UpsertTripSchema.Type
export type UpsertTripEncoded = typeof UpsertTripSchema.Encoded
