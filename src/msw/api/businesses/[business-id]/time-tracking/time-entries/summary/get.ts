import { Schema } from 'effect'

import { type TimeEntrySummary, TimeEntrySummarySchema } from '@schemas/features/timeTracking/timeEntrySummary'

import { buildTimeEntriesSummary } from '@fixtures/timeEntriesSummary/buildTimeEntriesSummary'
import { filterTimeEntries } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/get'
import { isActiveTimeEntry, timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeSummary = Schema.encodeSync(TimeEntrySummarySchema)

const toResponse = (summary: TimeEntrySummary) =>
  apiData(encodeSummary(summary))

export const get = createMockEndpoint<TimeEntrySummary, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/time-tracking/time-entries/summary',
  resolve: ({ override, request }) => {
    if (override) return toResponse(override)

    const recorded = timeEntryStore.all().filter(entry => !isActiveTimeEntry(entry))

    return toResponse(buildTimeEntriesSummary(filterTimeEntries(recorded, request)))
  },
})
