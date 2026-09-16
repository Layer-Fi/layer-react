import { upsertTaxProfileResolver } from '@msw/api/businesses/[business-id]/tax-estimates/profile/upsertResolver'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const patch = createMockEndpoint({
  method: 'patch',
  path: '*/v1/businesses/:businessId/tax-estimates/profile',
  resolve: upsertTaxProfileResolver,
})
