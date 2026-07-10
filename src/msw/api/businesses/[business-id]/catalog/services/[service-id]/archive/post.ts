import { Schema } from 'effect'

import { type CatalogService, CatalogServiceSchema } from '@schemas/catalogService'

import { catalogServiceStore } from '@msw/api/businesses/[business-id]/catalog/services/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreTransformResolver } from '@msw/utils/createStoreResolvers'
import { makeCatalogService } from '@fixtures/catalogServices/mocks'

const encodeCatalogService = Schema.encodeSync(CatalogServiceSchema)

export const toArchiveCatalogServiceResponse = (service: CatalogService) =>
  apiData(encodeCatalogService(service))

export const post = createMockEndpoint<CatalogService, ReturnType<typeof toArchiveCatalogServiceResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/catalog/services/:serviceId/archive',
  resolve: createStoreTransformResolver({
    idParam: 'serviceId',
    store: catalogServiceStore,
    makeBase: id => makeCatalogService({ id }),
    transform: service => ({ ...service, archivedAt: new Date() }),
    toResponse: toArchiveCatalogServiceResponse,
  }),
})
