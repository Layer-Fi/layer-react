import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

// The client only reacts to the request settling; the body is never read.
export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/bank-accounts/:bankAccountId/opening-balance',
  resolve: () => apiData({}),
})
