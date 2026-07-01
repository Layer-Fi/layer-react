import { Schema } from 'effect'
import useSWR from 'swr'

import { type CatalogService, CatalogServiceSchema } from '@schemas/catalogService'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const LIST_CATALOG_SERVICES_TAG_KEY = '#list-catalog-services'

const ListCatalogServicesResponseSchema = Schema.Struct({
  data: Schema.Array(CatalogServiceSchema),
})
type ListCatalogServicesResponse = typeof ListCatalogServicesResponseSchema.Type

const buildKey = createBuildKey<{ businessId: string, allowArchived?: boolean }>([LIST_CATALOG_SERVICES_TAG_KEY])

const listCatalogServices = get<
  typeof ListCatalogServicesResponseSchema.Encoded,
  { businessId: string, allowArchived?: boolean }
>(({ businessId, allowArchived }) => {
  const parameters = toDefinedSearchParameters({ allowArchived })
  return `/v1/businesses/${businessId}/catalog/services?${parameters}`
})

export type UseListCatalogServicesOptions = {
  allowArchived?: boolean
  isEnabled?: boolean
}

export function useListCatalogServices({
  allowArchived,
  isEnabled = true,
}: UseListCatalogServicesOptions = {}): SWRQueryResult<ListCatalogServicesResponse> {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => withLocale(buildKey({
      ...data,
      businessId,
      allowArchived,
      isEnabled,
    })),
    ({ accessToken, apiUrl, businessId, allowArchived: allowArchivedParam }) => listCatalogServices(
      apiUrl,
      accessToken,
      {
        params: { businessId, allowArchived: allowArchivedParam },
      },
    )().then(Schema.decodeUnknownPromise(ListCatalogServicesResponseSchema)),
  )

  return new SWRQueryResult(response)
}

export const useCatalogServicesGlobalCacheActions = createInfiniteQueryGlobalCacheActions<
  CatalogService
>(LIST_CATALOG_SERVICES_TAG_KEY)
