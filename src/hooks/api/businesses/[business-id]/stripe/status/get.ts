import { StripeAccountStatusResponseSchema } from '@schemas/features/invoices/stripeAccountStatus'
import { get } from '@utils/shared/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const STRIPE_ACCOUNT_STATUS_TAG_KEY = '#stripe-account-status'

const getStripeAccountStatus = get<
  typeof StripeAccountStatusResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/stripe/status`)

export const useGetStripeAccountStatus = createQueryHook({
  tags: [STRIPE_ACCOUNT_STATUS_TAG_KEY],
  request: getStripeAccountStatus,
  schema: StripeAccountStatusResponseSchema,
})
