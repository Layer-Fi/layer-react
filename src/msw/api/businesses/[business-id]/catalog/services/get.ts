import { Schema } from 'effect'

import { type CatalogService, CatalogServiceSchema } from '@schemas/catalogService'

import { catalogServiceStore } from '@msw/api/businesses/[business-id]/catalog/services/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, requiresFlag } from '@msw/utils/createListFilter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeCatalogService = Schema.encodeSync(CatalogServiceSchema)

const toResponse = (services: readonly CatalogService[], request: Request) =>
  paginatedApiData(services.map(service => encodeCatalogService(service)), request)

const filterCatalogServices = createListFilter<CatalogService>({
  allow_archived: requiresFlag(service => service.archivedAt != null),
})

export const get = createMockEndpoint<readonly CatalogService[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/catalog/services',
  resolve: ({ override: services = catalogServiceStore.all(), request }) =>
    toResponse(filterCatalogServices(services, request), request),
})
