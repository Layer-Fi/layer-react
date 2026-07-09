import { StripeAccountStatus } from '@schemas/stripeAccountStatus'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const get = createMockEndpoint<StripeAccountStatus, ReturnType<typeof apiData>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/stripe/status',
  resolve: ({ override }) => apiData({ account_status: override ?? StripeAccountStatus.Active }),
})
