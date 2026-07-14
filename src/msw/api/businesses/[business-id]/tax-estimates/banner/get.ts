import { Schema } from 'effect'

import { type TaxEstimatesBanner, TaxEstimatesBannerResponseSchema } from '@schemas/taxEstimates/banner'

import { resolveYearParam } from '@msw/api/businesses/[business-id]/tax-estimates/resolveYearParam'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeTaxBanner } from '@fixtures/taxEstimates/mocks'

const toResponse = Schema.encodeSync(TaxEstimatesBannerResponseSchema)

export const get = createMockEndpoint<TaxEstimatesBanner, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/tax-estimates/banner',
  resolve: ({ override, request }) =>
    toResponse(override ?? makeTaxBanner(resolveYearParam(request))),
})
