import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { CatalogServiceSchema, type UpdateCatalogServiceEncoded } from '@schemas/catalogService'
import { patch } from '@utils/api/authenticatedHttp'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import {
  CATALOG_SERVICES_TAG_KEY,
  useCatalogServicesGlobalCacheActions,
} from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
      tags: [UPDATE_CATALOG_SERVICE_TAG_KEY, CATALOG_SERVICES_TAG_KEY],
    } as const
  }
}

type UseUpdateCatalogServiceProps = {
  serviceId: string
}

export function useUpdateCatalogService({ serviceId }: UseUpdateCatalogServiceProps) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { patchCatalogServiceByKey } = useCatalogServicesGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      serviceId,
    }),
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
