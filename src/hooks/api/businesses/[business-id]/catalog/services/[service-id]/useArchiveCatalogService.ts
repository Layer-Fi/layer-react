import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { CatalogServiceSchema } from '@schemas/catalogService'
import { post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import {
  CATALOG_SERVICES_TAG_KEY,
  useCatalogServicesGlobalCacheActions,
} from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const ARCHIVE_CATALOG_SERVICE_TAG_KEY = '#archive-catalog-service'

const ArchiveCatalogServiceResponseSchema = Schema.Struct({
  data: CatalogServiceSchema,
})
type ArchiveCatalogServiceResponse = typeof ArchiveCatalogServiceResponseSchema.Type

const archiveCatalogService = post<ArchiveCatalogServiceResponse>(
  ({ businessId, serviceId }) =>
    `/v1/businesses/${businessId}/catalog/services/${serviceId}/archive`,
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
      tags: [ARCHIVE_CATALOG_SERVICE_TAG_KEY, CATALOG_SERVICES_TAG_KEY],
    } as const
  }
}

type UseArchiveCatalogServiceProps = {
  serviceId: string
}

export function useArchiveCatalogService({ serviceId }: UseArchiveCatalogServiceProps) {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { forceReloadCatalogServices } = useCatalogServicesGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
      serviceId,
    })),
    ({ accessToken, apiUrl, businessId, serviceId: sid }) => archiveCatalogService(
      apiUrl,
      accessToken,
      {
        params: { businessId, serviceId: sid },
      },
    ).then(Schema.decodeUnknownPromise(ArchiveCatalogServiceResponseSchema)),
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
