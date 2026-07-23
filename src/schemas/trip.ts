import { pipe, Schema } from 'effect'

import { NonRecursiveBigDecimalSchema } from '@schemas/nonRecursiveBigDecimal'
import { VehicleSchema } from '@schemas/vehicle'

import { CalendarDateFromSelf, CalendarDateSchema } from './common/calendarDateFromSelf'

export enum TripPurpose {
  Unreviewed = 'UNREVIEWED',
  Business = 'BUSINESS',
  Personal = 'PERSONAL',
}

export enum TripDistanceSource {
  Manual = 'MANUAL',
  Computed = 'COMPUTED',
}
const TripPurposeSchema = Schema.Enums(TripPurpose)

const TransformedTripPurposeSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(TripPurposeSchema),
  {
    decode: (input) => {
      if (Object.values(TripPurposeSchema.enums).includes(input as TripPurpose)) {
        return input as TripPurpose
      }

      return TripPurpose.Business
    },
    encode: input => input,
  },
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
    Schema.optional(Schema.NullOr(Schema.Enums(TripDistanceSource))),
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
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('google_start_place_id'),
  ),

  googleEndPlaceId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('google_end_place_id'),
  ),

  startLatitude: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('start_latitude'),
  ),

  startLongitude: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('start_longitude'),
  ),

  endLatitude: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('end_latitude'),
  ),

  endLongitude: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
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

export const TripPlaceSchema = Schema.Struct({
  placeId: Schema.String,
  latitude: Schema.NullOr(Schema.String),
  longitude: Schema.NullOr(Schema.String),
})

export type TripPlace = typeof TripPlaceSchema.Type

export const makeTripPlace = (
  { placeId, latitude, longitude }: {
    placeId: string
    latitude?: string | null
    longitude?: string | null
  },
): TripPlace => ({
  placeId,
  latitude: latitude ?? null,
  longitude: longitude ?? null,
})

export const TripFormAddressSchema = Schema.Struct({
  address: Schema.String,
  place: Schema.NullOr(TripPlaceSchema),
})

export type TripFormAddress = typeof TripFormAddressSchema.Type

export const TripFormSchema = Schema.Struct({
  vehicle: Schema.NullOr(VehicleSchema),
  tripDate: Schema.NullOr(CalendarDateFromSelf),
  distance: NonRecursiveBigDecimalSchema,
  purpose: TripPurposeSchema,
  start: TripFormAddressSchema,
  end: TripFormAddressSchema,
  description: Schema.String,
})

export type TripForm = typeof TripFormSchema.Type

export const UpsertTripSchema = Schema.Struct({
  vehicleId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('vehicle_id'),
  ),
  tripDate: pipe(
    Schema.propertySignature(CalendarDateSchema),
    Schema.fromKey('trip_date'),
  ),
  /* Omitted when the server should derive it from the two Google place IDs. */
  distance: Schema.optional(Schema.BigDecimal),
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
