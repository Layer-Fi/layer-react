import { StripeConnectAccountLinkDataSchema } from '@schemas/stripeConnectAccountLink'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const STRIPE_CONNECT_ACCOUNT_LINK_TAG_KEY = '#stripe-connect-account-link'

const StripeConnectAccountLinkSchema = UnwrappedDataResponseSchema(StripeConnectAccountLinkDataSchema)

type StripeConnectAccountLinkResponse = typeof StripeConnectAccountLinkDataSchema.Type

const createStripeConnectAccountLink = post<
  typeof StripeConnectAccountLinkSchema.Encoded,
  never,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/stripe/connect-account-link`)

export const useStripeConnectAccountLink = createMutationHook<
  typeof StripeConnectAccountLinkSchema.Encoded,
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
