import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { CatalogServiceSchema, type CreateCatalogServiceEncoded } from '@schemas/catalogService'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useCatalogServicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const CREATE_CATALOG_SERVICE_TAG_KEY = '#create-catalog-service'

type CreateCatalogServiceBody = CreateCatalogServiceEncoded

const CreateCatalogServiceResponseSchema = Schema.Struct({
  data: CatalogServiceSchema,
})
type CreateCatalogServiceResponse = typeof CreateCatalogServiceResponseSchema.Type

const createCatalogService = post<
  CreateCatalogServiceResponse,
  CreateCatalogServiceBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/catalog/services`)

const buildKey = createBuildKey<{ businessId: string }>([CREATE_CATALOG_SERVICE_TAG_KEY])

export function useCreateCatalogService() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const { forceReload: forceReloadCatalogServices } = useCatalogServicesGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: CreateCatalogServiceBody },
    ) => createCatalogService(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body,
      },
    ).then(Schema.decodeUnknownPromise(CreateCatalogServiceResponseSchema)),
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
