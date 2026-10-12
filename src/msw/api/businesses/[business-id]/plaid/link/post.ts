import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

// Unique per request, like the real backend: the link modal only reopens when
// the token actually changes.
let linkTokenSequence = 0

export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/plaid/link',
  resolve: () => apiData({
    type: 'Link_Token',
    link_token: `link-sandbox-mock-token-${++linkTokenSequence}`,
    hosted_link: null,
  }),
})
