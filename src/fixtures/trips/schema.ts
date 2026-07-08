import { Arbitrary, BigDecimal, type FastCheck, Schema } from 'effect'

import { TripPurpose, TripSchema } from '@schemas/trip'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { addresses } from '@fixtures/constants/personal/addresses'
import { vehicles as vehiclePool } from '@fixtures/generated/vehicles.gen'
import { calendarDateArbitrary } from '@fixtures/utils/calendarDateArbitrary'
import { dateArbitrary } from '@fixtures/utils/dateArbitrary'
import { externalIdArbitrary } from '@fixtures/utils/externalIdArbitrary'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/idArbitrary'
import { nullableConstantFrom } from '@fixtures/utils/nullableConstantFromArbitrary'
import { withArbitrary } from '@fixtures/utils/withArbitrary'

const distanceArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.integer({ min: 20, max: 200 }), weight: 6 },
    { arbitrary: fc.integer({ min: 201, max: 500 }), weight: 3 },
    { arbitrary: fc.integer({ min: 501, max: 1000 }), weight: 1 },
  ).map(n => BigDecimal.unsafeFromString((n / 10).toFixed(1)))

const fields = TripSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.trip)),
  vehicle: withArbitrary(fields.vehicle, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: 1 },
      { arbitrary: fc.constantFrom(...vehiclePool), weight: 4 },
    )),
  externalId: withArbitrary(fields.externalId, () => externalIdArbitrary),
  distance: withArbitrary(fields.distance, () => distanceArbitrary),
  tripDate: withArbitrary(fields.tripDate, () => calendarDateArbitrary(FIXTURE_YEAR)),
  purpose: withArbitrary(fields.purpose, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(TripPurpose.Business), weight: 6 },
      { arbitrary: fc.constant(TripPurpose.Personal), weight: 2 },
      { arbitrary: fc.constant(TripPurpose.Unreviewed), weight: 1 },
    )),
  startAddress: withArbitrary(fields.startAddress, () => nullableConstantFrom(addresses)),
  endAddress: withArbitrary(fields.endAddress, () => nullableConstantFrom(addresses)),
  description: withArbitrary(fields.description, () => nullableConstantFrom(
    ['Client meeting', 'Site visit', 'Airport pickup', 'Supply run'],
    { nullWeight: 3, valueWeight: 1 },
  )),
  createdAt: withArbitrary(fields.createdAt, () => dateArbitrary),
  updatedAt: withArbitrary(fields.updatedAt, () => dateArbitrary),
  deletedAt: withArbitrary(fields.deletedAt, () => fc => fc.constant(null)),
})

const baseArbitrary = Arbitrary.make(base)

export const TripArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((trip): typeof base.Type => {
      const [createdAt, updatedAt] = [trip.createdAt, trip.updatedAt].sort((a, b) => a.getTime() - b.getTime())

      const addressPool: readonly string[] = addresses
      const endAddress = trip.startAddress != null && trip.startAddress === trip.endAddress
        ? addressPool[(addressPool.indexOf(trip.startAddress) + 1) % addressPool.length]
        : trip.endAddress

      return { ...trip, createdAt, updatedAt, endAddress }
    }),
})

export const schema = TripArbitrarySchema
