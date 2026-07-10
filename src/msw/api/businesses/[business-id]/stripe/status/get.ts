import { Schema } from 'effect'

import { StripeAccountStatus, StripeAccountStatusDataSchema } from '@schemas/stripeAccountStatus'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeAccountStatus = Schema.encodeSync(StripeAccountStatusDataSchema)

export const get = createMockEndpoint<StripeAccountStatus, ReturnType<typeof apiData>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/stripe/status',
  resolve: ({ override }) => apiData(encodeAccountStatus({ accountStatus: override ?? StripeAccountStatus.Active })),
})
