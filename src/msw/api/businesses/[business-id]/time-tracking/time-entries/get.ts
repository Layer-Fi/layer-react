import { Schema } from 'effect'

import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'

import { isActiveTimeEntry, timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import {
  createListFilter,
  matchesBoolean,
  matchesOnOrAfter,
  matchesOnOrBefore,
  matchesValue,
  requiresFlag,
} from '@msw/utils/createListFilter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeTimeEntry = Schema.encodeSync(TimeEntrySchema)

const toResponse = (entries: readonly TimeEntry[], request: Request) =>
  paginatedApiData(entries.map(entry => encodeTimeEntry(entry)), request)

const byNewestFirst = (a: TimeEntry, b: TimeEntry) =>
  b.date.compare(a.date) || b.createdAt.getTime() - a.createdAt.getTime()

export const filterTimeEntries = createListFilter<TimeEntry>({
  customer_id: matchesValue(entry => entry.customer?.id),
  service_id: matchesValue(entry => entry.service?.id),
  status: matchesValue(entry => entry.status),
  billable: matchesBoolean(entry => entry.billable),
  has_customer: matchesBoolean(entry => entry.customer != null),
  include_deleted: requiresFlag(entry => entry.deletedAt != null),
  start_date: matchesOnOrAfter(entry => entry.date),
  end_date: matchesOnOrBefore(entry => entry.date),
})

export const get = createMockEndpoint<readonly TimeEntry[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/time-tracking/time-entries',
  resolve: ({ override: entries = timeEntryStore.all(), request }) => {
    const statusFilter = new URL(request.url).searchParams.get('status')
    const visible = statusFilter ? entries : entries.filter(entry => !isActiveTimeEntry(entry))

    return toResponse([...filterTimeEntries(visible, request)].sort(byNewestFirst), request)
  },
})
