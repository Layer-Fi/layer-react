import { Arbitrary, Schema } from 'effect'

import { VehicleSchema } from '@schemas/vehicle'

import { makeBusiness } from '@fixtures/business/mocks'
import { dateArbitrary } from '@fixtures/utils/arbitrary/date'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'
import {
  isEligibleForDeletionArbitrary,
  licensePlateArbitrary,
  makeAndModelArbitrary,
  vehicleDescriptionArbitrary,
  vinArbitrary,
} from '@fixtures/vehicles/arbitrary'

const BUSINESS_ID = makeBusiness().id

const fields = VehicleSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.vehicle)),
  businessId: withArbitrary(fields.businessId, () => fc => fc.constant(BUSINESS_ID)),
  externalId: withArbitrary(fields.externalId, () => fc => fc.constant(null)),
  makeAndModel: withArbitrary(fields.makeAndModel, () => makeAndModelArbitrary),
  year: withArbitrary(fields.year, () => fc => fc.integer({ min: 2015, max: 2024 })),
  licensePlate: withArbitrary(fields.licensePlate, () => licensePlateArbitrary),
  vin: withArbitrary(fields.vin, () => vinArbitrary),
  description: withArbitrary(fields.description, () => vehicleDescriptionArbitrary),
  createdAt: withArbitrary(fields.createdAt, () => dateArbitrary),
  updatedAt: withArbitrary(fields.updatedAt, () => dateArbitrary),
  deletedAt: withArbitrary(fields.deletedAt, () => fc => fc.constant(null)),
  archivedAt: withArbitrary(fields.archivedAt, () => fc => fc.constant(null)),
  isPrimary: withArbitrary(fields.isPrimary, () => fc => fc.constant(false)),
  isEligibleForDeletion: withArbitrary(fields.isEligibleForDeletion, () => isEligibleForDeletionArbitrary),
})

const baseArbitrary = Arbitrary.make(base)

export const VehicleArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((vehicle): typeof base.Type => {
      const [createdAt, updatedAt] = [vehicle.createdAt, vehicle.updatedAt].sort((a, b) => a.getTime() - b.getTime())

      return { ...vehicle, createdAt, updatedAt }
    }),
})

export const schema = VehicleArbitrarySchema
