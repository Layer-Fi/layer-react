import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { type CatalogService, CatalogServiceSchema } from '@schemas/catalogService'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const CATALOG_SERVICES_TAG_KEY = '#catalog-services'
const LIST_CATALOG_SERVICES_TAG_KEY = '#list-catalog-services'

const ListCatalogServicesResponseSchema = Schema.Struct({
  data: Schema.Array(CatalogServiceSchema),
})
type ListCatalogServicesResponse = typeof ListCatalogServicesResponseSchema.Type

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  allowArchived,
  isEnabled = true,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  allowArchived?: boolean
  isEnabled?: boolean
}) {
  if (!isEnabled) {
    return
  }

  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      allowArchived,
      tags: [CATALOG_SERVICES_TAG_KEY, LIST_CATALOG_SERVICES_TAG_KEY],
    } as const
  }
}

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

export function useListCatalogServices({ allowArchived, isEnabled = true }: UseListCatalogServicesOptions = {}) {
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

  return new SWRQueryResult<ListCatalogServicesResponse>(response)
}

export const useCatalogServicesGlobalCacheActions = () => {
  const { patchCache, forceReload } = useGlobalCacheActions()

  const patchCatalogServiceByKey = useCallback((updatedService: CatalogService) =>
    patchCache<ListCatalogServicesResponse | undefined>(
      ({ tags }) => tags.includes(LIST_CATALOG_SERVICES_TAG_KEY),
      (currentData) => {
        if (!currentData) {
          return currentData
        }

        return {
          ...currentData,
          data: currentData.data.map(service => service.id === updatedService.id ? updatedService : service),
        }
      },
    ),
  [patchCache],
  )

  const forceReloadCatalogServices = useCallback(
    () => forceReload(({ tags }) => tags.includes(CATALOG_SERVICES_TAG_KEY)),
    [forceReload],
  )

  return {
    patchCatalogServiceByKey,
    forceReloadCatalogServices,
  }
}
