import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { CatalogServiceSchema } from '@schemas/catalogService'
import { post } from '@utils/api/authenticatedHttp'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import {
  CATALOG_SERVICES_TAG_KEY,
  useCatalogServicesGlobalCacheActions,
} from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const UNARCHIVE_CATALOG_SERVICE_TAG_KEY = '#unarchive-catalog-service'

const UnarchiveCatalogServiceResponseSchema = Schema.Struct({
  data: CatalogServiceSchema,
})
type UnarchiveCatalogServiceResponse = typeof UnarchiveCatalogServiceResponseSchema.Type

const unarchiveCatalogService = post<UnarchiveCatalogServiceResponse>(
  ({ businessId, serviceId }) =>
    `/v1/businesses/${businessId}/catalog/services/${serviceId}/unarchive`,
)

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
      tags: [UNARCHIVE_CATALOG_SERVICE_TAG_KEY, CATALOG_SERVICES_TAG_KEY],
    } as const
  }
}

type UseUnarchiveCatalogServiceProps = {
  serviceId: string
}

export function useUnarchiveCatalogService({ serviceId }: UseUnarchiveCatalogServiceProps) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { forceReloadCatalogServices } = useCatalogServicesGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      serviceId,
    }),
    ({ accessToken, apiUrl, businessId, serviceId: sid }) => unarchiveCatalogService(
      apiUrl,
      accessToken,
      {
        params: { businessId, serviceId: sid },
      },
    ).then(Schema.decodeUnknownPromise(UnarchiveCatalogServiceResponseSchema)),
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
