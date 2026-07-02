import { pipe, Schema } from 'effect'

import { post } from '@utils/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

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

const StripeConnectAccountLinkSchema = Schema.transform(
  StripeConnectAccountLinkResponseSchema,
  Schema.typeSchema(StripeConnectAccountLinkDataSchema),
  {
    strict: true,
    decode: ({ data }) => data,
    encode: data => ({ data }),
  },
)

type StripeConnectAccountLinkResponse = typeof StripeConnectAccountLinkDataSchema.Type

const createStripeConnectAccountLink = post<
  typeof StripeConnectAccountLinkResponseSchema.Encoded,
  never,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/stripe/connect-account-link`)

export const useStripeConnectAccountLink = createMutationHook<
  typeof StripeConnectAccountLinkResponseSchema.Encoded,
  never,
  { businessId: string },
  StripeConnectAccountLinkResponse,
  never
>({
  tags: [STRIPE_CONNECT_ACCOUNT_LINK_TAG_KEY],
  request: createStripeConnectAccountLink,
  schema: StripeConnectAccountLinkSchema,
  swrOptions: { throwOnError: true },
})
