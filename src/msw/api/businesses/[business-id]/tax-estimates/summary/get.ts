import { Schema } from 'effect'

import { type TaxSummary, TaxSummaryResponseSchema } from '@schemas/taxEstimates/summary'

import { resolveYearParam } from '@msw/api/businesses/[business-id]/tax-estimates/resolveYearParam'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeTaxSummary } from '@fixtures/taxEstimates/mocks'

// Encoding the unwrapped-response transform re-adds the `data` envelope.
const toResponse = Schema.encodeSync(TaxSummaryResponseSchema)

export const get = createMockEndpoint<TaxSummary, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/tax-estimates/summary',
  resolve: ({ override, request }) =>
    toResponse(override ?? makeTaxSummary(resolveYearParam(request))),
})
