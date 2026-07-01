import { Schema } from 'effect'
import useSWR from 'swr'

import {
  type BookkeepingConfiguration,
  BookkeepingConfigurationResponseSchema,
  BookkeepingStatus,
  TransactionTaggingStrategy,
} from '@schemas/bookkeepingConfiguration'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export type { BookkeepingConfiguration }
export { BookkeepingStatus, TransactionTaggingStrategy }

export const BOOKKEEPING_CONFIGURATION_TAG_KEY = '#bookkeeping-configuration'

type GetBookkeepingConfigurationParams = {
  businessId: string
}

const buildKey = createBuildKey<{ businessId: string }>([BOOKKEEPING_CONFIGURATION_TAG_KEY])

const getBookkeepingConfiguration = get<
  Record<string, unknown>,
  GetBookkeepingConfigurationParams
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/bookkeeping/config`
})

export function useBookkeepingConfiguration() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const queryKey = withLocale(buildKey({
    ...auth,
    businessId,
  }))

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

  return new SWRQueryResult(response)
}
