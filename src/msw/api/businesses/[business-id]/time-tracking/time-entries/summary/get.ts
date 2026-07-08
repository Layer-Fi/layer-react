import { Schema } from 'effect'

import { type TimeEntrySummary, TimeEntrySummarySchema } from '@schemas/timeTracking'

import { listTimeEntries } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/get'
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
  resolve: ({ override, request }) => {
    if (override) return toResponse(override)

    const recorded = timeEntryStore.all().filter(entry => entry.status !== 'ACTIVE')

    return toResponse(buildTimeEntriesSummary(listTimeEntries(recorded, request)))
  },
})
