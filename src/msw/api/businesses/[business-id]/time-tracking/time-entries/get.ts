import { parseDate } from '@internationalized/date'
import { Schema } from 'effect'

import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'

import { timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesBoolean, matchesValue, requiresFlag } from '@msw/utils/createListFilter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { timeEntries as seedTimeEntries } from '@fixtures/generated/timeEntries.gen'

const encodeTimeEntry = Schema.encodeSync(TimeEntrySchema)

const toResponse = (entries: readonly TimeEntry[], request: Request) =>
  paginatedApiData(entries.map(entry => encodeTimeEntry(entry)), request)

const SEED_IDS = new Set<string>(seedTimeEntries.map(entry => entry.id))

const isBlank = (value: string | null) => value == null || value === ''

const filterTimeEntries = createListFilter<TimeEntry>({
  customer_id: matchesValue(entry => entry.customer?.id),
  service_id: matchesValue(entry => entry.service?.id),
  status: matchesValue(entry => entry.status),
  billable: matchesBoolean(entry => entry.billable),
  has_customer: matchesBoolean(entry => entry.customer != null),
  include_deleted: requiresFlag(entry => entry.deletedAt != null),
})

const withinRequestedDateRange = (entry: TimeEntry, request: Request) => {
  const params = new URL(request.url).searchParams
  const start = params.get('start_date')
  const end = params.get('end_date')

  return (isBlank(start) || entry.date.compare(parseDate(start)) >= 0)
    && (isBlank(end) || entry.date.compare(parseDate(end)) <= 0)
}

export const listTimeEntries = (entries: readonly TimeEntry[], request: Request) =>
  filterTimeEntries(entries, request)
    .filter(entry => !SEED_IDS.has(entry.id) || withinRequestedDateRange(entry, request))

export const get = createMockEndpoint<readonly TimeEntry[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/time-tracking/time-entries',
  resolve: ({ override: entries = timeEntryStore.all(), request }) => {
    const statusFilter = new URL(request.url).searchParams.get('status')
    const visible = statusFilter ? entries : entries.filter(entry => entry.status !== 'ACTIVE')

    return toResponse(listTimeEntries(visible, request), request)
  },
})
