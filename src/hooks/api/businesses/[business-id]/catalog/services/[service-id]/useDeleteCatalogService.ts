import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { del } from '@utils/api/authenticatedHttp'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import {
  CATALOG_SERVICES_TAG_KEY,
  useCatalogServicesGlobalCacheActions,
} from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const DELETE_CATALOG_SERVICE_TAG_KEY = '#delete-catalog-service'

const deleteCatalogService = del<
  Record<string, never>,
  { businessId: string, serviceId: string }
>(({ businessId, serviceId }) => `/v1/businesses/${businessId}/catalog/services/${serviceId}`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  serviceId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  serviceId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      serviceId,
      tags: [DELETE_CATALOG_SERVICE_TAG_KEY, CATALOG_SERVICES_TAG_KEY],
    } as const
  }
}

type UseDeleteCatalogServiceProps = {
  serviceId: string
}

export function useDeleteCatalogService({ serviceId }: UseDeleteCatalogServiceProps) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { forceReloadCatalogServices } = useCatalogServicesGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      serviceId,
    }),
    ({ accessToken, apiUrl, businessId, serviceId }) => deleteCatalogService(
      apiUrl,
      accessToken,
      {
        params: { businessId, serviceId },
      },
    ),
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)
  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)
      void forceReloadCatalogServices()
      return triggerResult
    },
    [originalTrigger, forceReloadCatalogServices],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      return Reflect.get(target, prop)
    },
  })
}
