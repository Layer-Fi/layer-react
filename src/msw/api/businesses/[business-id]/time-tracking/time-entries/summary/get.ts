import { Schema } from 'effect'

import { type TimeEntrySummary, TimeEntrySummarySchema } from '@schemas/timeTracking'

import { timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { buildTimeEntriesSummary } from '@fixtures/timeEntriesSummary/buildTimeEntriesSummary'

const encodeSummary = Schema.encodeSync(TimeEntrySummarySchema)

const toResponse = (summary: TimeEntrySummary) =>
  apiData(encodeSummary(summary))

export const get = createMockEndpoint<TimeEntrySummary, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/time-tracking/time-entries/summary',
  // Recomputed per request so entry mutations are reflected in the summary.
  resolve: ({ override: summary = buildTimeEntriesSummary(timeEntryStore.all()) }) => toResponse(summary),
})
