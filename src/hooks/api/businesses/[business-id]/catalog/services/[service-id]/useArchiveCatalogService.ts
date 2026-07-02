import { useCallback } from 'react'
import { Schema } from 'effect'

import { CatalogServiceSchema } from '@schemas/catalogService'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useCatalogServicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const ARCHIVE_CATALOG_SERVICE_TAG_KEY = '#archive-catalog-service'

const ArchiveCatalogServiceResponseSchema = Schema.Struct({
  data: CatalogServiceSchema,
})

const archiveCatalogService = post<
  typeof ArchiveCatalogServiceResponseSchema.Encoded,
  Record<string, unknown>,
  { businessId: string, serviceId: string }
>(
  ({ businessId, serviceId }) =>
    `/v1/businesses/${businessId}/catalog/services/${serviceId}/archive`,
)

const useArchiveCatalogServiceMutation = createMutationHook({
  tags: [ARCHIVE_CATALOG_SERVICE_TAG_KEY],
  request: archiveCatalogService,
  keyParams: ['serviceId'],
  argToBody: (_arg: never) => undefined,
  schema: ArchiveCatalogServiceResponseSchema,
  swrOptions: { throwOnError: true },
})

type UseArchiveCatalogServiceProps = {
  serviceId: string
}

export function useArchiveCatalogService({ serviceId }: UseArchiveCatalogServiceProps) {
  const { forceReload: forceReloadCatalogServices } = useCatalogServicesGlobalCacheActions()

  const mutationResponse = useArchiveCatalogServiceMutation({ serviceId })
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
