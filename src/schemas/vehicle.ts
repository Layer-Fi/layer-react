import { Schema, pipe } from 'effect'

export const VehicleSchema = Schema.Struct({
  id: Schema.UUID,

  businessId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('business_id'),
  ),

  externalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),

  make: Schema.String,

  model: Schema.String,

  year: Schema.Number,

  licensePlate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('license_plate'),
  ),

  vin: Schema.NullishOr(Schema.String),

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

export type Vehicle = typeof VehicleSchema.Type
export type VehicleEncoded = typeof VehicleSchema.Encoded
