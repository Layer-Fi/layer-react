import { Schema } from 'effect'

import { type MileageSummary, MileageSummarySchema } from '@schemas/mileage'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeMileageSummary } from '@fixtures/mileageSummary/mocks'

const encodeMileageSummary = Schema.encodeSync(MileageSummarySchema)

const toResponse = (summary: MileageSummary) =>
  apiData(encodeMileageSummary(summary))

export const get = createMockEndpoint<MileageSummary, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/mileage/summary',
  resolve: ({ override: summary = makeMileageSummary() }) => toResponse(summary),
})
