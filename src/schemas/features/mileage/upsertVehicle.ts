import { pipe, Schema } from 'effect'

export const UpsertVehicleSchema = Schema.Struct({
  makeAndModel: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('make_and_model'),
  ),
  year: Schema.NullishOr(Schema.Number),
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
