import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/plaid/link/outcome',
  resolve: () => apiData({}),
})
