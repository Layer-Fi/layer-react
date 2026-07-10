import { Schema } from 'effect'

import { type CatalogService, CatalogServiceSchema } from '@schemas/catalogService'

import { catalogServiceFromRequest } from '@msw/api/businesses/[business-id]/catalog/services/catalogServiceFromRequest'
import { catalogServiceStore } from '@msw/api/businesses/[business-id]/catalog/services/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreCreateResolver } from '@msw/utils/createStoreResolvers'
import { makeCatalogService } from '@fixtures/catalogServices/mocks'

const encodeCatalogService = Schema.encodeSync(CatalogServiceSchema)

export const toCreateCatalogServiceResponse = (service: CatalogService) =>
  apiData(encodeCatalogService(service))

export const post = createMockEndpoint<CatalogService, ReturnType<typeof toCreateCatalogServiceResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/catalog/services',
  resolve: createStoreCreateResolver({
    store: catalogServiceStore,
    makeBase: id => makeCatalogService({ id, name: '', billableRatePerHourAmount: null }),
    fromRequest: catalogServiceFromRequest,
    toResponse: toCreateCatalogServiceResponse,
  }),
})
