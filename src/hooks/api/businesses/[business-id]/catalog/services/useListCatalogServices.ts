import { Schema } from 'effect'

import { type CatalogService, CatalogServiceSchema } from '@schemas/catalogService'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

const LIST_CATALOG_SERVICES_TAG_KEY = '#list-catalog-services'

const ListCatalogServicesResponseSchema = Schema.Struct({
  data: Schema.Array(CatalogServiceSchema),
})

type ListCatalogServicesParams = {
  businessId: string
  allowArchived?: boolean
}

const listCatalogServices = getWithQuery<
  typeof ListCatalogServicesResponseSchema.Encoded,
  ListCatalogServicesParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/catalog/services`,
)

export type UseListCatalogServicesOptions = {
  allowArchived?: boolean
  isEnabled?: boolean
}

export const useListCatalogServices = createQueryHook({
  tags: [LIST_CATALOG_SERVICES_TAG_KEY],
  request: listCatalogServices,
  schema: ListCatalogServicesResponseSchema,
})

export const useCatalogServicesGlobalCacheActions = createInfiniteQueryGlobalCacheActions<
  CatalogService
>(LIST_CATALOG_SERVICES_TAG_KEY)
