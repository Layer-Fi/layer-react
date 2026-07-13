import { Schema } from 'effect'

import { type CatalogService, CatalogServiceSchema } from '@schemas/catalogService'

import { catalogServiceFromRequest } from '@msw/api/businesses/[business-id]/catalog/services/catalogServiceFromRequest'
import { catalogServiceStore } from '@msw/api/businesses/[business-id]/catalog/services/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreUpdateResolver } from '@msw/utils/createStoreResolvers'
import { makeCatalogService } from '@fixtures/catalogServices/mocks'

const encodeCatalogService = Schema.encodeSync(CatalogServiceSchema)

export const toUpdateCatalogServiceResponse = (service: CatalogService) =>
  apiData(encodeCatalogService(service))

export const patch = createMockEndpoint<CatalogService, ReturnType<typeof toUpdateCatalogServiceResponse>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/catalog/services/:serviceId',
  resolve: createStoreUpdateResolver({
    idParam: 'serviceId',
    store: catalogServiceStore,
    makeBase: id => makeCatalogService({ id }),
    fromRequest: catalogServiceFromRequest,
    toResponse: toUpdateCatalogServiceResponse,
  }),
})
