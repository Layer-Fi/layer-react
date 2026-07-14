import { Schema } from 'effect'

import { type TaxDetails, TaxDetailsResponseSchema } from '@schemas/taxEstimates/details'

import { resolveYearParam } from '@msw/api/businesses/[business-id]/tax-estimates/resolveYearParam'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeTaxDetails } from '@fixtures/taxEstimates/mocks'

const toResponse = Schema.encodeSync(TaxDetailsResponseSchema)

export const get = createMockEndpoint<TaxDetails, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/tax-estimates/details',
  resolve: ({ override, request }) =>
    toResponse(override ?? makeTaxDetails(resolveYearParam(request))),
})
