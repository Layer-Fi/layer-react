import { Schema } from 'effect'
import useSWR, { type SWRConfiguration } from 'swr'

import {
  type ApiPlaidHostedLinkStatus,
  ApiPlaidHostedLinkStatusSchema,
} from '@schemas/linkedAccounts/plaid'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const PLAID_HOSTED_LINK_TAG_KEY = '#plaid-hosted-link'

const PlaidHostedLinkStatusResponseSchema = Schema.Struct({
  data: ApiPlaidHostedLinkStatusSchema,
})

const getPlaidHostedLinkStatus = get<
  { data: ApiPlaidHostedLinkStatus },
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/hosted-link`)

const buildKey = createBuildKey<{ businessId: string }>([PLAID_HOSTED_LINK_TAG_KEY])

export function usePlaidHostedLinkStatus(
  config?: SWRConfiguration<ApiPlaidHostedLinkStatus>,
  enabled = false,
) {
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => buildKey({ ...auth, apiUrl, businessId, isEnabled: enabled }),
    ({ accessToken, apiUrl, businessId }) =>
      getPlaidHostedLinkStatus(apiUrl, accessToken, { params: { businessId } })()
        .then(Schema.decodeUnknownPromise(PlaidHostedLinkStatusResponseSchema))
        .then(({ data }) => data),
    config,
  )

  return new SWRQueryResult(swrResponse)
}
