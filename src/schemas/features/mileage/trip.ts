import { pipe, Schema } from 'effect'

import { CalendarDateSchema } from '@schemas/common/calendarDateFromSelf'
import { createTransformedEnumSchema } from '@schemas/common/utils'
import { VehicleSchema } from '@schemas/features/mileage/vehicle'

export enum TripPurpose {
  Unreviewed = 'UNREVIEWED',
  Business = 'BUSINESS',
  Personal = 'PERSONAL',
}

export enum TripPurposeFilterValue {
  All = 'ALL',
  Business = TripPurpose.Business,
  Personal = TripPurpose.Personal,
}

export enum TripDistanceSource {
  Manual = 'MANUAL',
  Computed = 'COMPUTED',
}
export const TripPurposeSchema = Schema.Enums(TripPurpose)

const TransformedTripPurposeSchema = createTransformedEnumSchema(
  TripPurposeSchema,
  TripPurpose,
  TripPurpose.Unreviewed,
)

const TransformedTripDistanceSourceSchema = createTransformedEnumSchema(
  Schema.Enums(TripDistanceSource),
  TripDistanceSource,
  TripDistanceSource.Manual,
)

export const TripSchema = Schema.Struct({
  id: Schema.UUID,

  vehicle: Schema.NullishOr(VehicleSchema),

  externalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),

  distance: Schema.BigDecimal,

  distanceSource: pipe(
    Schema.propertySignature(Schema.NullishOr(TransformedTripDistanceSourceSchema)),
    Schema.fromKey('distance_source'),
  ),

  tripDate: pipe(
    Schema.propertySignature(CalendarDateSchema),
    Schema.fromKey('trip_date'),
  ),

  purpose: TransformedTripPurposeSchema,

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

  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('created_at'),
  ),

  updatedAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('updated_at'),
  ),

  deletedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('deleted_at'),
  ),
})

export type Trip = typeof TripSchema.Type
export type TripEncoded = typeof TripSchema.Encoded
