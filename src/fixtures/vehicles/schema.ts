import { Arbitrary, Schema } from 'effect'

import { VehicleSchema } from '@schemas/vehicle'

import { makeBusiness } from '@fixtures/business/mocks'
import { dateArbitrary } from '@fixtures/utils/arbitrary/date'
import { externalIdArbitrary } from '@fixtures/utils/arbitrary/externalId'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { nullableConstantFrom } from '@fixtures/utils/arbitrary/nullableConstantFrom'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'
import {
  isEligibleForDeletionArbitrary,
  isPrimaryArbitrary,
  licensePlateArbitrary,
  makeAndModelArbitrary,
  vehicleArchivedAtArbitrary,
  vehicleDeletedAtArbitrary,
  vinArbitrary,
} from '@fixtures/vehicles/arbitrary'
import { vehicleDescriptions } from '@fixtures/vehicles/constants'

const BUSINESS_ID = makeBusiness().id

const fields = VehicleSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.vehicle)),
  businessId: withArbitrary(fields.businessId, () => fc => fc.constant(BUSINESS_ID)),
  externalId: withArbitrary(fields.externalId, () => externalIdArbitrary),
  makeAndModel: withArbitrary(fields.makeAndModel, () => makeAndModelArbitrary),
  year: withArbitrary(fields.year, () => fc => fc.integer({ min: 2015, max: 2024 })),
  licensePlate: withArbitrary(fields.licensePlate, () => licensePlateArbitrary),
  vin: withArbitrary(fields.vin, () => vinArbitrary),
  description: withArbitrary(fields.description, () => nullableConstantFrom(
    vehicleDescriptions,
    { nullWeight: 4, valueWeight: 1 },
  )),
  createdAt: withArbitrary(fields.createdAt, () => dateArbitrary),
  updatedAt: withArbitrary(fields.updatedAt, () => dateArbitrary),
  deletedAt: withArbitrary(fields.deletedAt, () => vehicleDeletedAtArbitrary),
  archivedAt: withArbitrary(fields.archivedAt, () => vehicleArchivedAtArbitrary),
  isPrimary: withArbitrary(fields.isPrimary, () => isPrimaryArbitrary),
  isEligibleForDeletion: withArbitrary(fields.isEligibleForDeletion, () => isEligibleForDeletionArbitrary),
})

const baseArbitrary = Arbitrary.make(base)

export const VehicleArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((vehicle): typeof base.Type => {
      const [createdAt, updatedAt] = [vehicle.createdAt, vehicle.updatedAt].sort((a, b) => a.getTime() - b.getTime())
      const archivedAt = vehicle.archivedAt == null
        ? vehicle.archivedAt
        : [updatedAt, vehicle.archivedAt].sort((a, b) => a.getTime() - b.getTime()).at(-1) ?? null
      const deletedAt = vehicle.deletedAt == null
        ? vehicle.deletedAt
        : [updatedAt, vehicle.deletedAt].sort((a, b) => a.getTime() - b.getTime()).at(-1) ?? null

      return { ...vehicle, createdAt, updatedAt, archivedAt, deletedAt }
    }),
})

export const schema = VehicleArbitrarySchema
