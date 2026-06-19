import { Schema } from 'effect'
import useSWR, { type SWRConfiguration } from 'swr'

import {
  type ApiPlaidHostedLinkStatus,
  ApiPlaidHostedLinkStatusSchema,
} from '@schemas/linkedAccounts/plaid'
import { get } from '@utils/api/authenticatedHttp'
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

function buildKey({
  accessToken,
  apiUrl,
  businessId,
  enabled,
}: {
  accessToken?: string
  apiUrl: string
  businessId: string
  enabled: boolean
}) {
  if (!enabled || !accessToken) return null

  return {
    accessToken,
    apiUrl,
    businessId,
    tags: [PLAID_HOSTED_LINK_TAG_KEY],
  } as const
}

export function usePlaidHostedLinkStatus(
  config?: SWRConfiguration<ApiPlaidHostedLinkStatus>,
  enabled = false,
) {
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => buildKey({ accessToken: auth?.access_token, apiUrl, businessId, enabled }),
    ({ accessToken, apiUrl, businessId }) =>
      getPlaidHostedLinkStatus(apiUrl, accessToken, { params: { businessId } })()
        .then(Schema.decodeUnknownPromise(PlaidHostedLinkStatusResponseSchema))
        .then(({ data }) => data),
    config,
  )

  return new SWRQueryResult(swrResponse)
}
