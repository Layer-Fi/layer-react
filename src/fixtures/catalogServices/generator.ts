import { schema } from '@fixtures/catalogServices/schema'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { createGenerator } from '@fixtures/utils/createGenerator'

const generateCatalogServices = createGenerator(schema, {
  uniqueBy: [service => service.id, service => service.name],
  numRuns: 10,
})

const ARCHIVED_COUNT = 2

export const generator: typeof generateCatalogServices = (overrides) => {
  const services = generateCatalogServices(overrides)

  return services.map((service, index) => ({
    ...service,
    archivedAt: index >= services.length - ARCHIVED_COUNT
      ? new Date(Date.UTC(FIXTURE_YEAR, 5, 1))
      : null,
  }))
}
