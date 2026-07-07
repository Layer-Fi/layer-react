import { CalendarDate } from '@internationalized/date'

import { schema } from '@fixtures/trips/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

const generateTrips = createGenerator(schema, {
  uniqueBy: [trip => trip.externalId],
  numRuns: 60,
})

const YEAR = 2025
const DAYS_IN_YEAR = 365

const spreadTripDate = (index: number, total: number) => {
  const dayOffset = Math.floor((index * DAYS_IN_YEAR) / total)
  const date = new Date(Date.UTC(YEAR, 0, 1 + dayOffset))

  return new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

export const generator: typeof generateTrips = overrides => {
  const trips = generateTrips(overrides)

  return trips
    .map((trip, index) => ({ ...trip, tripDate: spreadTripDate(index, trips.length) }))
    .sort((a, b) => b.tripDate.compare(a.tripDate))
}
