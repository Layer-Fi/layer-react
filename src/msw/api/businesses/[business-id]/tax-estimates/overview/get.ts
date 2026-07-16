import { Schema } from 'effect'

import { type TaxOverviewApiData, TaxOverviewApiResponseSchema } from '@schemas/taxEstimates/overview'

import { resolveYearParam } from '@msw/api/businesses/[business-id]/tax-estimates/resolveYearParam'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeTaxOverview } from '@fixtures/taxEstimates/mocks'

const toResponse = Schema.encodeSync(TaxOverviewApiResponseSchema)

export const get = createMockEndpoint<TaxOverviewApiData, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/tax-estimates/overview',
  resolve: ({ override, request }) =>
    toResponse(override ?? makeTaxOverview(resolveYearParam(request))),
})
