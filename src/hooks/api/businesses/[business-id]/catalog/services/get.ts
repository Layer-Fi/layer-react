import { type CatalogService, CatalogServiceSchema } from '@schemas/catalogService'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@hooks/utils/swr/createInfiniteQueryGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

const LIST_CATALOG_SERVICES_TAG_KEY = '#list-catalog-services'

const ListCatalogServicesResultSchema = PaginatedResponseSchema(CatalogServiceSchema)

type ListCatalogServicesParams = {
  businessId: string
  allowArchived?: boolean
  cursor?: string
}

const listCatalogServices = getWithQuery<
  typeof ListCatalogServicesResultSchema.Encoded,
  ListCatalogServicesParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/catalog/services`,
)

export type UseListCatalogServicesOptions = {
  allowArchived?: boolean
  isEnabled?: boolean
}

export const useListCatalogServices = createInfiniteQueryHook({
  tags: [LIST_CATALOG_SERVICES_TAG_KEY],
  request: listCatalogServices,
  schema: ListCatalogServicesResultSchema,
})

export const useCatalogServicesGlobalCacheActions = createInfiniteQueryGlobalCacheActions<
  CatalogService
>(LIST_CATALOG_SERVICES_TAG_KEY)
