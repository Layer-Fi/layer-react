import { useCallback } from 'react'
import { Schema } from 'effect'

import { CatalogServiceSchema, type CreateCatalogServiceEncoded } from '@schemas/catalogService'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useCatalogServicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const CREATE_CATALOG_SERVICE_TAG_KEY = '#create-catalog-service'

type CreateCatalogServiceBody = CreateCatalogServiceEncoded

const CreateCatalogServiceResponseSchema = Schema.Struct({
  data: CatalogServiceSchema,
})

const createCatalogService = post<
  typeof CreateCatalogServiceResponseSchema.Encoded,
  CreateCatalogServiceBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/catalog/services`)

const useCreateCatalogServiceMutation = createMutationHook({
  tags: [CREATE_CATALOG_SERVICE_TAG_KEY],
  request: createCatalogService,
  schema: CreateCatalogServiceResponseSchema,
  swrOptions: { throwOnError: true },
})

export function useCreateCatalogService() {
  const { forceReload: forceReloadCatalogServices } = useCatalogServicesGlobalCacheActions()

  const mutationResponse = useCreateCatalogServiceMutation()
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
