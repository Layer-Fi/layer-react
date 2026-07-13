import { Schema } from 'effect'

import { StripeConnectAccountLinkDataSchema } from '@schemas/stripeConnectAccountLink'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const LINK_TTL_MS = 5 * 60 * 1000

const encodeConnectAccountLink = Schema.encodeSync(StripeConnectAccountLinkDataSchema)

export const post = createMockEndpoint<string, ReturnType<typeof apiData>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/stripe/connect-account-link',
  resolve: ({ override }) => apiData(encodeConnectAccountLink({
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + LINK_TTL_MS).toISOString(),
    connectAccountUrl: override ?? 'https://connect.stripe.example/setup',
  })),
})
