import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { CatalogServiceSchema, type UpdateCatalogServiceEncoded } from '@schemas/catalogService'
import { patch } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useCatalogServicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const UPDATE_CATALOG_SERVICE_TAG_KEY = '#update-catalog-service'

type UpdateCatalogServiceBody = UpdateCatalogServiceEncoded

const UpdateCatalogServiceResponseSchema = Schema.Struct({
  data: CatalogServiceSchema,
})
type UpdateCatalogServiceResponse = typeof UpdateCatalogServiceResponseSchema.Type

const updateCatalogService = patch<
  UpdateCatalogServiceResponse,
  UpdateCatalogServiceBody,
  { businessId: string, serviceId: string }
>(({ businessId, serviceId }) => `/v1/businesses/${businessId}/catalog/services/${serviceId}`)

const buildKey = createBuildKey<{ businessId: string, serviceId: string }>([UPDATE_CATALOG_SERVICE_TAG_KEY])

type UseUpdateCatalogServiceProps = {
  serviceId: string
}

export function useUpdateCatalogService({ serviceId }: UseUpdateCatalogServiceProps) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const { patchByKey: patchCatalogServiceByKey } = useCatalogServicesGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      serviceId,
    })),
    (
      { accessToken, apiUrl, businessId, serviceId },
      { arg: body }: { arg: UpdateCatalogServiceBody },
    ) => updateCatalogService(
      apiUrl,
      accessToken,
      {
        params: { businessId, serviceId },
        body,
      },
    ).then(Schema.decodeUnknownPromise(UpdateCatalogServiceResponseSchema)),
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
      void patchCatalogServiceByKey(triggerResult.data)
      return triggerResult
    },
    [originalTrigger, patchCatalogServiceByKey],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
