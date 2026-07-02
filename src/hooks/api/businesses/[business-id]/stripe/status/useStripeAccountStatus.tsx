import { StripeAccountStatusResponseSchema } from '@schemas/stripeAccountStatus'
import { get } from '@utils/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const STRIPE_ACCOUNT_STATUS_TAG_KEY = '#stripe-account-status'

const getStripeAccountStatus = get<
  typeof StripeAccountStatusResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/stripe/status`)

export const useStripeAccountStatus = createQueryHook({
  tags: [STRIPE_ACCOUNT_STATUS_TAG_KEY],
  request: getStripeAccountStatus,
  schema: StripeAccountStatusResponseSchema,
  select: ({ data }) => data,
})
