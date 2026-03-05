import { pipe, Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { post } from '@utils/api/authenticatedHttp'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
      tags: [STRIPE_CONNECT_ACCOUNT_LINK_TAG_KEY],
    } as const
  }
}

export function useStripeConnectAccountLink() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      apiUrl,
      businessId,
    }),
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
