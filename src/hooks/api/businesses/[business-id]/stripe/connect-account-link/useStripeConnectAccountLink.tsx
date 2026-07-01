import { pipe, Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const STRIPE_CONNECT_ACCOUNT_LINK_TAG_KEY = '#stripe-connect-account-link'

const StripeConnectAccountLinkDataSchema = Schema.Struct({
  createdAt: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('created_at'),
  ),
  expiresAt: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('expires_at'),
  ),
  connectAccountUrl: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('connect_account_url'),
  ),
})

const StripeConnectAccountLinkResponseSchema = Schema.Struct({
  data: StripeConnectAccountLinkDataSchema,
})

type StripeConnectAccountLinkResponse = typeof StripeConnectAccountLinkDataSchema.Type

const createStripeConnectAccountLink = post<
  { data: StripeConnectAccountLinkResponse },
  never,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/stripe/connect-account-link`)

const buildKey = createBuildKey<{ businessId: string }>([STRIPE_CONNECT_ACCOUNT_LINK_TAG_KEY])

export function useStripeConnectAccountLink() {
  const { withLocale, businessId, apiUrl, auth } = useBuildKeyInputs()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      apiUrl,
      businessId,
    })),
    ({ accessToken, apiUrl, businessId }) => {
      return createStripeConnectAccountLink(
        apiUrl,
        accessToken,
        { params: { businessId } },
      ).then(Schema.decodeUnknownPromise(StripeConnectAccountLinkResponseSchema)).then(({ data }) => data)
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  return new SWRMutationResult(rawMutationResponse)
}
