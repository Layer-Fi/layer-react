import { Schema } from 'effect'
import useSWR from 'swr'

import { type CatalogService, CatalogServiceSchema } from '@schemas/catalogService'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { CATALOG_SERVICES_TAG_KEY } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const GET_CATALOG_SERVICE_TAG_KEY = '#get-catalog-service'

const GetCatalogServiceResponseSchema = Schema.Struct({
  data: CatalogServiceSchema,
})

const getCatalogService = get<
  typeof GetCatalogServiceResponseSchema.Encoded,
  { businessId: string, serviceId: string, allowDeleted?: boolean }
>(({ businessId, serviceId, allowDeleted }) => {
  const parameters = toDefinedSearchParameters({ allowDeleted })
  const baseUrl = `/v1/businesses/${businessId}/catalog/services/${serviceId}`
  const query = parameters.toString()
  return query ? `${baseUrl}?${query}` : baseUrl
})

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  serviceId,
  allowDeleted,
  isEnabled,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  serviceId: string
  allowDeleted?: boolean
  isEnabled: boolean
}) {
  if (!isEnabled) {
    return
  }

  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      serviceId,
      allowDeleted,
      tags: [GET_CATALOG_SERVICE_TAG_KEY, CATALOG_SERVICES_TAG_KEY],
    } as const
  }
}

type UseGetCatalogServiceParameters = {
  serviceId: string
  allowDeleted?: boolean
  isEnabled?: boolean
}

export function useGetCatalogService({ serviceId, allowDeleted, isEnabled = true }: UseGetCatalogServiceParameters) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => buildKey({
      ...data,
      businessId,
      serviceId,
      allowDeleted,
      isEnabled: isEnabled && serviceId !== '',
    }),
    ({ accessToken, apiUrl, businessId, serviceId: sid, allowDeleted: allowDeletedParam }) => getCatalogService(
      apiUrl,
      accessToken,
      {
        params: { businessId, serviceId: sid, allowDeleted: allowDeletedParam },
      },
    )()
      .then(Schema.decodeUnknownPromise(GetCatalogServiceResponseSchema))
      .then(({ data }) => data),
  )

  return new SWRQueryResult<CatalogService>(response)
}
