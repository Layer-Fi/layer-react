import { Schema } from 'effect'

export const VehicleFormSchema = Schema.Struct({
  makeAndModel: Schema.String,
  year: Schema.NullishOr(Schema.Number),
  licensePlate: Schema.String,
  vin: Schema.String,
  description: Schema.String,
  isPrimary: Schema.Boolean,
})

export type VehicleForm = typeof VehicleFormSchema.Type
