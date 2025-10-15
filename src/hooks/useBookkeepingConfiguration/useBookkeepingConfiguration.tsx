import { Schema } from 'effect'
import useSWR, { type SWRResponse } from 'swr'
import { get } from '../../api/layer/authenticated_http'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import {
  BookkeepingConfiguration,
  BookkeepingConfigurationResponseSchema,
  BookkeepingStatus,
  TransactionTaggingStrategy,
} from '../../schemas/bookkeepingConfiguration'

export type { BookkeepingConfiguration }
export { BookkeepingStatus, TransactionTaggingStrategy }

export const BOOKKEEPING_CONFIGURATION_TAG_KEY = '#bookkeeping-configuration'

class BookkeepingConfigurationSWRResponse {
  private swrResponse: SWRResponse<BookkeepingConfiguration>

  constructor(swrResponse: SWRResponse<BookkeepingConfiguration>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }

  get mutate() {
    return this.swrResponse.mutate
  }
}

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

export function useBookkeepingConfiguration({
  businessId,
}: GetBookkeepingConfigurationParams) {
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

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

  return new BookkeepingConfigurationSWRResponse(response)
}
