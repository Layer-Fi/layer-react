import { useCallback } from 'react'

import { CatalogServiceSchema } from '@schemas/catalogService'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useCatalogServicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const REACTIVATE_CATALOG_SERVICE_TAG_KEY = '#reactivate-catalog-service'

const ReactivateCatalogServiceResponseSchema = UnwrappedDataResponseSchema(CatalogServiceSchema)

const reactivateCatalogService = post<
  typeof ReactivateCatalogServiceResponseSchema.Encoded,
  Record<string, unknown>,
  { businessId: string, serviceId: string }
>(
  ({ businessId, serviceId }) =>
    `/v1/businesses/${businessId}/catalog/services/${serviceId}/reactivate`,
)

const useReactivateCatalogServiceMutation = createMutationHook({
  tags: [REACTIVATE_CATALOG_SERVICE_TAG_KEY],
  request: reactivateCatalogService,
  keyParamNames: ['serviceId'],
  argToBody: (_arg: never) => undefined,
  schema: ReactivateCatalogServiceResponseSchema,
  swrOptions: { throwOnError: true },
})

type UseReactivateCatalogServiceProps = {
  serviceId: string
}

export function useReactivateCatalogService({ serviceId }: UseReactivateCatalogServiceProps) {
  const { forceReload: forceReloadCatalogServices } = useCatalogServicesGlobalCacheActions()

  const mutationResponse = useReactivateCatalogServiceMutation({ serviceId })
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
