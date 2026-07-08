import { CalendarDate } from '@internationalized/date'
import { Schema } from 'effect'

import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'

import { timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'
import { timeEntryFromUpsertRequest } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/timeEntryFromUpsertRequest'
import { findActiveTimeEntry } from '@msw/api/businesses/[business-id]/time-tracking/tracker/activeTimeEntry'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeBusiness } from '@fixtures/business/mocks'

const encodeTimeEntry = Schema.encodeSync(TimeEntrySchema)

const toResponse = (entry: TimeEntry) => apiData(encodeTimeEntry(entry))

const today = () => {
  const now = new Date()
  return new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

const newActiveEntry = (): TimeEntry => {
  const now = new Date()
  return {
    id: crypto.randomUUID(),
    businessId: makeBusiness().id,
    externalId: null,
    date: today(),
    durationMinutes: 0,
    billable: true,
    description: null,
    memo: null,
    metadata: null,
    customer: null,
    service: null,
    invoiceLineItem: null,
    status: 'ACTIVE',
    stoppedAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
}

export const post = createMockEndpoint<TimeEntry, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/time-tracking/tracker/start',
  resolve: async ({ override, request }) => {
    if (override) return toResponse(override)

    const existing = findActiveTimeEntry()
    if (existing != null) return toResponse(existing)

    const entry = await timeEntryFromUpsertRequest(request, newActiveEntry())
    timeEntryStore.save(entry)

    return toResponse(entry)
  },
})
