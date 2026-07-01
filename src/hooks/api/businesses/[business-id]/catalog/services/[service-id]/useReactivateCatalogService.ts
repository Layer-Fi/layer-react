import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { CatalogServiceSchema } from '@schemas/catalogService'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useCatalogServicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const REACTIVATE_CATALOG_SERVICE_TAG_KEY = '#reactivate-catalog-service'

const ReactivateCatalogServiceResponseSchema = Schema.Struct({
  data: CatalogServiceSchema,
})
type ReactivateCatalogServiceResponse = typeof ReactivateCatalogServiceResponseSchema.Type

const reactivateCatalogService = post<ReactivateCatalogServiceResponse>(
  ({ businessId, serviceId }) =>
    `/v1/businesses/${businessId}/catalog/services/${serviceId}/reactivate`,
)

const buildKey = createBuildKey<{ businessId: string, serviceId: string }>([REACTIVATE_CATALOG_SERVICE_TAG_KEY])

type UseReactivateCatalogServiceProps = {
  serviceId: string
}

export function useReactivateCatalogService({ serviceId }: UseReactivateCatalogServiceProps) {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { forceReload: forceReloadCatalogServices } = useCatalogServicesGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
      serviceId,
    })),
    ({ accessToken, apiUrl, businessId, serviceId: sid }) => reactivateCatalogService(
      apiUrl,
      accessToken,
      {
        params: { businessId, serviceId: sid },
      },
    ).then(Schema.decodeUnknownPromise(ReactivateCatalogServiceResponseSchema)),
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

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
