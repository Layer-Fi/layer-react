import { pipe, Schema } from 'effect'

import { VehicleSchema } from '@schemas/vehicle'

import { CalendarDateFromSelf, CalendarDateSchema } from './common/calendarDateFromSelf'

export enum TripPurpose {
  Unreviewed = 'UNREVIEWED',
  Business = 'BUSINESS',
  Personal = 'PERSONAL',
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

  vehicle: VehicleSchema,

  externalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),

  distance: Schema.BigDecimal,

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

export const TripFormSchema = Schema.Struct({
  vehicle: Schema.NullOr(VehicleSchema),
  tripDate: Schema.NullOr(CalendarDateFromSelf),
  distance: Schema.BigDecimal,
  purpose: TripPurposeSchema,
  startAddress: Schema.String,
  endAddress: Schema.String,
  description: Schema.String,
})

export type TripForm = typeof TripFormSchema.Type

export const UpsertTripSchema = Schema.Struct({
  vehicleId: pipe(
    Schema.propertySignature(Schema.UUID),
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
  description: Schema.NullishOr(Schema.String),
})

export type UpsertTrip = typeof UpsertTripSchema.Type
export type UpsertTripEncoded = typeof UpsertTripSchema.Encoded
