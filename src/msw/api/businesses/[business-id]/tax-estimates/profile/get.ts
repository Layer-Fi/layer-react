import { Schema } from 'effect'

import { type TaxProfile, TaxProfileSchema } from '@schemas/taxEstimates/profile'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeTaxProfile } from '@fixtures/taxEstimates/mocks'

const encodeTaxProfile = Schema.encodeSync(TaxProfileSchema)

const toResponse = (profile: TaxProfile) => apiData(encodeTaxProfile(profile))

export const get = createMockEndpoint<TaxProfile, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/tax-estimates/profile',
  resolve: ({ override: profile = makeTaxProfile() }) => toResponse(profile),
})
