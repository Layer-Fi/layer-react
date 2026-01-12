import { pipe, Schema } from 'effect'

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

  makeAndModel: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('make_and_model'),
  ),

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

  archivedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('archived_at'),
  ),

  isPrimary: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_primary'),
  ),

  isEligibleForDeletion: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_eligible_for_deletion'),
  ),
})

export type Vehicle = typeof VehicleSchema.Type
export type VehicleEncoded = typeof VehicleSchema.Encoded

export const VehicleFormSchema = Schema.Struct({
  makeAndModel: Schema.String,
  year: Schema.Number,
  licensePlate: Schema.String,
  vin: Schema.String,
  description: Schema.String,
  isPrimary: Schema.Boolean,
})

export type VehicleForm = typeof VehicleFormSchema.Type

export const UpsertVehicleSchema = Schema.Struct({
  makeAndModel: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('make_and_model'),
  ),
  year: Schema.Number,
  licensePlate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('license_plate'),
  ),
  vin: Schema.NullishOr(Schema.String),
  description: Schema.NullishOr(Schema.String),
  isPrimary: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_primary'),
  ),
})

export type UpsertVehicle = typeof UpsertVehicleSchema.Type
export type UpsertVehicleEncoded = typeof UpsertVehicleSchema.Encoded
