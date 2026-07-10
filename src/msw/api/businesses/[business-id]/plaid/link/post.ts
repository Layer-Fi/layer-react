import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

// Unique per request, like the real backend: the link modal only reopens for a
// new session when the token actually changes.
let linkTokenSequence = 0

/**
 * Issues a placeholder link token; the SDK is mocked in Storybook
 * (`.storybook/mocks/react-plaid-link.ts`), so it is never sent to Plaid.
 */
export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/plaid/link',
  resolve: () => apiData({
    type: 'Link_Token',
    link_token: `link-sandbox-mock-token-${++linkTokenSequence}`,
    hosted_link: null,
  }),
})
