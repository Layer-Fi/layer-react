import { Arbitrary, Schema } from 'effect'

import { VehicleSchema } from '@schemas/vehicle'

import { makeBusiness } from '@fixtures/business/mocks'
import { dateArbitrary } from '@fixtures/utils/dateArbitrary'
import { externalIdArbitrary } from '@fixtures/utils/externalIdArbitrary'
import { withArbitrary } from '@fixtures/utils/withArbitrary'

const BUSINESS_ID = makeBusiness().id

const VIN_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'

const fields = VehicleSchema.fields

const base = Schema.Struct({
  ...fields,
  businessId: withArbitrary(fields.businessId, () => fc => fc.constant(BUSINESS_ID)),
  externalId: withArbitrary(fields.externalId, () => externalIdArbitrary),
  makeAndModel: withArbitrary(fields.makeAndModel, () => fc =>
    fc.constantFrom(
      'Toyota Camry',
      'Honda CR-V',
      'Ford F-150',
      'Tesla Model 3',
      'Chevrolet Silverado',
      'Subaru Outback',
      'Jeep Grand Cherokee',
      'Nissan Altima',
    )),
  year: withArbitrary(fields.year, () => fc =>
    fc.oneof(
      fc.constant(null),
      fc.integer({ min: 2015, max: 2024 }),
    )),
  licensePlate: withArbitrary(fields.licensePlate, () => fc =>
    fc.oneof(
      fc.constant(null),
      fc.tuple(
        fc.constantFrom('ABC', 'XYZ', 'JKL', 'QRS', 'MNO'),
        fc.integer({ min: 1000, max: 9999 }),
      ).map(([letters, digits]) => `${letters}-${digits}`),
    )),
  vin: withArbitrary(fields.vin, () => fc =>
    fc.oneof(
      fc.constant(null),
      fc.stringOf(fc.constantFrom(...VIN_CHARS.split('')), { minLength: 17, maxLength: 17 }),
    )),
  description: withArbitrary(fields.description, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: 4 },
      {
        arbitrary: fc.constantFrom(
          'Primary delivery vehicle',
          'Backup fleet vehicle',
          'Leased for sales team',
        ),
        weight: 1,
      },
    )),
  createdAt: withArbitrary(fields.createdAt, () => dateArbitrary),
  updatedAt: withArbitrary(fields.updatedAt, () => dateArbitrary),
  deletedAt: withArbitrary(fields.deletedAt, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: 19 },
      { arbitrary: dateArbitrary(fc), weight: 1 },
    )),
  archivedAt: withArbitrary(fields.archivedAt, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: 9 },
      { arbitrary: dateArbitrary(fc), weight: 1 },
    )),
  isPrimary: withArbitrary(fields.isPrimary, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(true), weight: 1 },
      { arbitrary: fc.constant(false), weight: 4 },
    )),
  isEligibleForDeletion: withArbitrary(fields.isEligibleForDeletion, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(true), weight: 4 },
      { arbitrary: fc.constant(false), weight: 1 },
    )),
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
