import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { schema } from '@fixtures/trips/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'
import { spreadDateAcrossYear } from '@fixtures/utils/spreadDateAcrossYear'

const generateTrips = createGenerator(schema, {
  uniqueBy: [trip => trip.id, trip => trip.externalId],
  numRuns: 60,
})

export const generator: typeof generateTrips = (overrides) => {
  const trips = generateTrips(overrides)

  return trips
    .map((trip, index) => ({ ...trip, tripDate: spreadDateAcrossYear(FIXTURE_YEAR, index, trips.length) }))
    .sort((a, b) => b.tripDate.compare(a.tripDate))
}
