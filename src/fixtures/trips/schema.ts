import { Arbitrary, Schema } from 'effect'

import { TripSchema } from '@schemas/trip'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { addresses } from '@fixtures/constants/personal/addresses'
import { distanceArbitrary, tripPurposeArbitrary, tripVehicleArbitrary } from '@fixtures/trips/arbitrary'
import { tripDescriptions } from '@fixtures/trips/constants'
import { calendarDateArbitrary } from '@fixtures/utils/arbitrary/calendarDate'
import { dateArbitrary } from '@fixtures/utils/arbitrary/date'
import { externalIdArbitrary } from '@fixtures/utils/arbitrary/externalId'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { nullableConstantFrom } from '@fixtures/utils/arbitrary/nullableConstantFrom'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const fields = TripSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.trip)),
  vehicle: withArbitrary(fields.vehicle, () => tripVehicleArbitrary),
  externalId: withArbitrary(fields.externalId, () => externalIdArbitrary),
  distance: withArbitrary(fields.distance, () => distanceArbitrary),
  tripDate: withArbitrary(fields.tripDate, () => calendarDateArbitrary(FIXTURE_YEAR)),
  purpose: withArbitrary(fields.purpose, () => tripPurposeArbitrary),
  startAddress: withArbitrary(fields.startAddress, () => nullableConstantFrom(addresses)),
  endAddress: withArbitrary(fields.endAddress, () => nullableConstantFrom(addresses)),
  description: withArbitrary(fields.description, () => nullableConstantFrom(
    tripDescriptions,
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
