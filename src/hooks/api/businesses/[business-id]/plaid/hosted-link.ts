import useSWR, { type SWRConfiguration } from 'swr'

import {
  type ApiPlaidHostedLinkStatus,
  ApiPlaidHostedLinkStatusSchema,
} from '@schemas/linkedAccounts/plaid'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const PLAID_HOSTED_LINK_TAG_KEY = '#plaid-hosted-link'

const PlaidHostedLinkStatusResponseSchema = UnwrappedDataResponseSchema(
  ApiPlaidHostedLinkStatusSchema,
)

const getPlaidHostedLinkStatus = get<
  typeof PlaidHostedLinkStatusResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/hosted-link`)

const buildKey = createBuildKey<{ businessId: string }>([PLAID_HOSTED_LINK_TAG_KEY])

const fetchPlaidHostedLinkStatus = createKeyedFetcher(
  getPlaidHostedLinkStatus,
  PlaidHostedLinkStatusResponseSchema,
)

export function usePlaidHostedLinkStatus(
  config?: SWRConfiguration<ApiPlaidHostedLinkStatus>,
  enabled = false,
) {
  const { businessId, auth } = useBuildKeyInputs()

  const swrResponse = useSWR(
    () => buildKey({ ...auth, businessId, isEnabled: enabled }),
    key => fetchPlaidHostedLinkStatus(key),
    config,
  )

  return new SWRQueryResult(swrResponse)
}
