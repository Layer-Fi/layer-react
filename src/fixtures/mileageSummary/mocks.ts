import { trips } from '@fixtures/generated/trips.gen'
import { buildMileageSummary } from '@fixtures/mileageSummary/buildMileageSummary'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseMileageSummary = buildMileageSummary(trips)

export const { make: makeMileageSummary, makeMany: makeMileageSummaries } =
  createFixtureFactory(baseMileageSummary)
