import { type FastCheck } from 'effect'

import { nullableConstantFrom } from '@fixtures/utils/arbitrary/nullableConstantFrom'
import { vehicleDescriptions, vehicleMakesAndModels } from '@fixtures/vehicles/constants'

const VIN_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'

export const makeAndModelArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...vehicleMakesAndModels)

export const licensePlateArbitrary = (fc: typeof FastCheck) =>
  fc.tuple(
    fc.constantFrom('ABC', 'XYZ', 'JKL', 'QRS', 'MNO'),
    fc.integer({ min: 1000, max: 9999 }),
  ).map(([letters, digits]) => `${letters}-${digits}`)

export const vinArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.stringOf(fc.constantFrom(...VIN_CHARS.split('')), { minLength: 17, maxLength: 17 }),
  )

export const isEligibleForDeletionArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant(true), weight: 4 },
    { arbitrary: fc.constant(false), weight: 1 },
  )

export const vehicleDescriptionArbitrary = nullableConstantFrom(
  vehicleDescriptions,
  { nullWeight: 4, valueWeight: 1 },
)
