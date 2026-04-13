import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { type CatalogService, CatalogServiceSchema } from '@schemas/catalogService'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
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
  allowDeleted,
  isEnabled = true,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  allowDeleted?: boolean
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
      allowDeleted,
      tags: [CATALOG_SERVICES_TAG_KEY, LIST_CATALOG_SERVICES_TAG_KEY],
    } as const
  }
}

const listCatalogServices = get<
  typeof ListCatalogServicesResponseSchema.Encoded,
  { businessId: string, allowDeleted?: boolean }
>(({ businessId, allowDeleted }) => {
  const parameters = toDefinedSearchParameters({ allowDeleted })
  const baseUrl = `/v1/businesses/${businessId}/catalog/services`
  const query = parameters.toString()
  return query ? `${baseUrl}?${query}` : baseUrl
})

export type UseListCatalogServicesOptions = {
  allowDeleted?: boolean
  isEnabled?: boolean
}

export function useListCatalogServices({ allowDeleted, isEnabled = true }: UseListCatalogServicesOptions = {}) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => buildKey({
      ...data,
      businessId,
      allowDeleted,
      isEnabled,
    }),
    ({ accessToken, apiUrl, businessId, allowDeleted: allowDeletedParam }) => listCatalogServices(
      apiUrl,
      accessToken,
      {
        params: { businessId, allowDeleted: allowDeletedParam },
      },
    )().then(Schema.decodeUnknownPromise(ListCatalogServicesResponseSchema)),
  )

  return new SWRQueryResult<ListCatalogServicesResponse>(response)
}

export const useCatalogServicesGlobalCacheActions = () => {
  const { invalidate, patchCache, forceReload } = useGlobalCacheActions()

  const invalidateCatalogServices = useCallback(
    () => invalidate(
      ({ tags }) => tags.includes(CATALOG_SERVICES_TAG_KEY),
    ),
    [invalidate],
  )

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
    invalidateCatalogServices,
    patchCatalogServiceByKey,
    forceReloadCatalogServices,
  }
}
