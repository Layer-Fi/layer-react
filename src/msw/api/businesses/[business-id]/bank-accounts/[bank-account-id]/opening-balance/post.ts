import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/bank-accounts/:bankAccountId/opening-balance',
  resolve: () => apiData({ type: 'Ledger_Entry' }),
})
