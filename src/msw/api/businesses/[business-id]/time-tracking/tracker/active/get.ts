import { Schema } from 'effect'

import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'

import { findActiveTimeEntry } from '@msw/api/businesses/[business-id]/time-tracking/tracker/activeTimeEntry'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeTimeEntry = Schema.encodeSync(TimeEntrySchema)

const toResponse = (entry: TimeEntry | null) =>
  apiData({ time_entry: entry == null ? null : encodeTimeEntry(entry) })

export const get = createMockEndpoint<TimeEntry | null, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/time-tracking/tracker/active',
  resolve: ({ override }) =>
    toResponse(override ?? findActiveTimeEntry() ?? null),
})
