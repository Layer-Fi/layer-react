import { CalendarDate } from '@internationalized/date'
import { Arbitrary, BigDecimal, type FastCheck, Schema } from 'effect'

import { TripPurpose, TripSchema } from '@schemas/trip'

import { addresses } from '@fixtures/constants/personal/addresses'
import { dateArbitrary } from '@fixtures/utils/dateArbitrary'
import { externalIdArbitrary } from '@fixtures/utils/externalIdArbitrary'
import { withArbitrary } from '@fixtures/utils/withArbitrary'
import { schema as vehicleSchema } from '@fixtures/vehicles/schema'

const vehicleArbitrary = Arbitrary.make(vehicleSchema)

const tripDateArbitrary = (fc: typeof FastCheck) =>
  fc.date({
    min: new Date('2025-01-01T00:00:00Z'),
    max: new Date('2025-12-31T23:59:59Z'),
    noInvalidDate: true,
  }).map(date => new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()))

const distanceArbitrary = (fc: typeof FastCheck) =>
  fc.integer({ min: 1, max: 5000 }).map(n => BigDecimal.unsafeFromString((n / 10).toFixed(1)))

const nullableConstantFrom = (values: readonly string[]) => (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.constantFrom(...values),
  )

const fields = TripSchema.fields

const base = Schema.Struct({
  ...fields,
  vehicle: withArbitrary(fields.vehicle, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: 1 },
      { arbitrary: vehicleArbitrary, weight: 4 },
    )),
  externalId: withArbitrary(fields.externalId, () => externalIdArbitrary),
  distance: withArbitrary(fields.distance, () => distanceArbitrary),
  tripDate: withArbitrary(fields.tripDate, () => tripDateArbitrary),
  purpose: withArbitrary(fields.purpose, () => fc =>
    fc.constantFrom(TripPurpose.Business, TripPurpose.Personal, TripPurpose.Unreviewed)),
  startAddress: withArbitrary(fields.startAddress, () => nullableConstantFrom(addresses)),
  endAddress: withArbitrary(fields.endAddress, () => nullableConstantFrom(addresses)),
  description: withArbitrary(fields.description, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: 3 },
      {
        arbitrary: fc.constantFrom(
          'Client meeting',
          'Site visit',
          'Airport pickup',
          'Supply run',
        ),
        weight: 1,
      },
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

      return { ...trip, createdAt, updatedAt }
    }),
})

export const schema = TripArbitrarySchema
