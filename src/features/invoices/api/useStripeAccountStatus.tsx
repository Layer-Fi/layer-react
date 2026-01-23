import { Schema } from 'effect'
import useSWR, { type SWRResponse } from 'swr'

import { type StripeAccountStatusResponse, StripeAccountStatusResponseSchema } from '@schemas/stripeAccountStatus'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const STRIPE_ACCOUNT_STATUS_TAG_KEY = '#stripe-account-status'

class StripeAccountStatusSWRResponse {
  private swrResponse: SWRResponse<StripeAccountStatusResponse>

  constructor(swrResponse: SWRResponse<StripeAccountStatusResponse>) {
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
      tags: [STRIPE_ACCOUNT_STATUS_TAG_KEY],
    } as const
  }
}

const getStripeAccountStatus = get<
  { data: StripeAccountStatusResponse },
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/stripe/status`)

export function useStripeAccountStatus() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()

  const response = useSWR(
    () => buildKey({
      ...data,
      apiUrl,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }) => getStripeAccountStatus(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )().then(Schema.decodeUnknownPromise(StripeAccountStatusResponseSchema)).then(({ data }) => data),
  )

  return new StripeAccountStatusSWRResponse(response)
}
