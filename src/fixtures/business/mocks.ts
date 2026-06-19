import { type Business } from '@schemas/business'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseBusiness: Business = {
  id: '00000000-0000-4000-8000-000000000201',
  activationAt: new Date('2024-01-01T00:00:00.000Z'),
  isDemo: false,
}

export const { make: makeBusiness, makeMany: makeBusinesses } =
  createFixtureFactory(baseBusiness)
