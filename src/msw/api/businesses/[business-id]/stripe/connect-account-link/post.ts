import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const LINK_TTL_MS = 5 * 60 * 1000

export const post = createMockEndpoint<string, ReturnType<typeof apiData>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/stripe/connect-account-link',
  resolve: ({ override }) => apiData({
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + LINK_TTL_MS).toISOString(),
    connect_account_url: override ?? 'https://connect.stripe.example/setup',
  }),
})
