import { parseDate } from '@internationalized/date'
import { Schema } from 'effect'

import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'

import { timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesBoolean, matchesValue, requiresFlag } from '@msw/utils/createListFilter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeTimeEntry = Schema.encodeSync(TimeEntrySchema)

const toResponse = (entries: readonly TimeEntry[], request: Request) =>
  paginatedApiData(entries.map(entry => encodeTimeEntry(entry)), request)

const isBlank = (value: string | null) => value == null || value === ''

const filterTimeEntries = createListFilter<TimeEntry>({
  customer_id: matchesValue(entry => entry.customer?.id),
  service_id: matchesValue(entry => entry.service?.id),
  status: matchesValue(entry => entry.status),
  billable: matchesBoolean(entry => entry.billable),
  has_customer: matchesBoolean(entry => entry.customer != null),
  include_deleted: requiresFlag(entry => entry.deletedAt != null),
  start_date: (entry, value) => isBlank(value) || entry.date.compare(parseDate(value)) >= 0,
  end_date: (entry, value) => isBlank(value) || entry.date.compare(parseDate(value)) <= 0,
})

export const get = createMockEndpoint<readonly TimeEntry[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/time-tracking/time-entries',
  resolve: ({ override: entries = timeEntryStore.all(), request }) => {
    const statusFilter = new URL(request.url).searchParams.get('status')
    const visible = statusFilter ? entries : entries.filter(entry => entry.status !== 'ACTIVE')

    return toResponse(filterTimeEntries(visible, request), request)
  },
})
