import { Schema } from 'effect'

import { type MileageSummary, MileageSummarySchema } from '@schemas/mileage'

import { tripStore } from '@msw/api/businesses/[business-id]/mileage/trips/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { buildMileageSummary } from '@fixtures/mileageSummary/buildMileageSummary'

const encodeMileageSummary = Schema.encodeSync(MileageSummarySchema)

const toResponse = (summary: MileageSummary) =>
  apiData(encodeMileageSummary(summary))

export const get = createMockEndpoint<MileageSummary, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/mileage/summary',
  // Recomputed per request so trip mutations are reflected in the summary.
  resolve: ({ override: summary = buildMileageSummary(tripStore.all()) }) => toResponse(summary),
})
