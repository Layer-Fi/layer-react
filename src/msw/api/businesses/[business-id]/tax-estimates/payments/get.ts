import { Schema } from 'effect'

import { TaxPaymentsResponseSchema } from '@schemas/taxEstimates/payments'

import { resolveYearParam } from '@msw/api/businesses/[business-id]/tax-estimates/resolveYearParam'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeTaxPayments } from '@fixtures/taxEstimates/mocks'

// Encoding the unwrapped-response transform re-adds the `data` envelope.
const toResponse = Schema.encodeSync(TaxPaymentsResponseSchema)

type TaxPaymentsData = Parameters<typeof toResponse>[0]

export const get = createMockEndpoint<TaxPaymentsData, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/tax-estimates/payments',
  resolve: ({ override, request }) =>
    toResponse(override ?? makeTaxPayments(resolveYearParam(request))),
})
