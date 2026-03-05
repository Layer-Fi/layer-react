import { Schema } from 'effect'
import useSWR from 'swr'

import { SWRQueryResultWithMutate } from '@utils/swr/SWRResponseTypes'
import {
  type BookkeepingConfiguration,
  BookkeepingConfigurationResponseSchema,
  BookkeepingStatus,
  TransactionTaggingStrategy,
} from '@schemas/bookkeepingConfiguration'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export type { BookkeepingConfiguration }
export { BookkeepingStatus, TransactionTaggingStrategy }

export const BOOKKEEPING_CONFIGURATION_TAG_KEY = '#bookkeeping-configuration'

type GetBookkeepingConfigurationParams = {
  businessId: string
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tag: [BOOKKEEPING_CONFIGURATION_TAG_KEY],
    } as const
  }
}

const getBookkeepingConfiguration = get<
  Record<string, unknown>,
  GetBookkeepingConfigurationParams
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/bookkeeping/config`
})

export function useBookkeepingConfiguration() {
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const queryKey = buildKey({
    ...auth,
    apiUrl,
    businessId,
  })

  const response = useSWR(
    () => queryKey,
    ({ accessToken, apiUrl, businessId }) =>
      getBookkeepingConfiguration(apiUrl, accessToken, {
        params: {
          businessId,
        },
      })()
        .then(Schema.decodeUnknownPromise(BookkeepingConfigurationResponseSchema))
        .then(({ data }) => data),
  )

  return new SWRQueryResultWithMutate(response)
}
