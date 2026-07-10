import { Schema } from 'effect'

import { type TaxSummary, TaxSummaryResponseSchema } from '@schemas/taxEstimates/summary'

import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeTaxSummary } from '@fixtures/taxEstimates/mocks'

// Encoding the unwrapped-response transform re-adds the `data` envelope.
const toResponse = Schema.encodeSync(TaxSummaryResponseSchema)

export const get = createMockEndpoint<TaxSummary, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/tax-estimates/summary',
  resolve: ({ override, request }) => {
    if (override) return toResponse(override)

    const yearParam = Number(new URL(request.url).searchParams.get('year'))
    const year = Number.isInteger(yearParam) && yearParam > 0 ? yearParam : new Date().getFullYear()

    return toResponse(makeTaxSummary(year))
  },
})
