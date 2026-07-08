import { BigDecimal, type FastCheck } from 'effect'

import { TripPurpose } from '@schemas/trip'

import { vehicles as vehiclePool } from '@fixtures/generated/vehicles.gen'
import { tripDescriptions } from '@fixtures/trips/constants'
import { nullableConstantFrom } from '@fixtures/utils/arbitrary/nullableConstantFrom'

export const distanceArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.integer({ min: 20, max: 200 }), weight: 6 },
    { arbitrary: fc.integer({ min: 201, max: 500 }), weight: 3 },
    { arbitrary: fc.integer({ min: 501, max: 1000 }), weight: 1 },
  ).map(n => BigDecimal.unsafeFromString((n / 10).toFixed(1)))

export const tripVehicleArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant(null), weight: 1 },
    { arbitrary: fc.constantFrom(...vehiclePool), weight: 4 },
  )

export const tripPurposeArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant(TripPurpose.Business), weight: 6 },
    { arbitrary: fc.constant(TripPurpose.Personal), weight: 2 },
    { arbitrary: fc.constant(TripPurpose.Unreviewed), weight: 1 },
  )

export const tripDescriptionArbitrary = nullableConstantFrom(
  tripDescriptions,
  { nullWeight: 3, valueWeight: 1 },
)
