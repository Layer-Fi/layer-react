import { Schema } from 'effect'
import useSWR from 'swr'

import { type StripeAccountStatusResponse, StripeAccountStatusResponseSchema } from '@schemas/stripeAccountStatus'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const STRIPE_ACCOUNT_STATUS_TAG_KEY = '#stripe-account-status'

const buildKey = createBuildKey<{ businessId: string }>([STRIPE_ACCOUNT_STATUS_TAG_KEY])

const getStripeAccountStatus = get<
  { data: StripeAccountStatusResponse },
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/stripe/status`)

export function useStripeAccountStatus() {
  const { withLocale, businessId, apiUrl, auth } = useBuildKeyInputs()

  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
      apiUrl,
      businessId,
    })),
    ({ accessToken, apiUrl, businessId }) => getStripeAccountStatus(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )().then(Schema.decodeUnknownPromise(StripeAccountStatusResponseSchema)).then(({ data }) => data),
  )

  return new SWRQueryResult(response)
}
