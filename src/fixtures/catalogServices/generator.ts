import { schema } from '@fixtures/catalogServices/schema'
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
      ? service.archivedAt ?? new Date('2025-06-01T00:00:00.000Z')
      : null,
  }))
}
