import { type CatalogService } from '@schemas/catalogService'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseCatalogService: CatalogService = {
  id: '00000000-0000-4000-8000-000000000601',
  name: 'Consulting',
  billableRatePerHourAmount: 15000,
  archivedAt: null,
}

export const { make: makeCatalogService, makeMany: makeCatalogServices } =
  createFixtureFactory(baseCatalogService)
