import { CalendarDate } from '@internationalized/date'
import { Schema } from 'effect'

import { StartTrackerSchema, type TimeEntry, TimeEntrySchema, type TimeEntryService } from '@schemas/timeTracking'

import { catalogServiceStore } from '@msw/api/businesses/[business-id]/catalog/services/store'
import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'
import { toTimeEntryService } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/timeEntryFromUpsertRequest'
import { findActiveTimeEntry } from '@msw/api/businesses/[business-id]/time-tracking/tracker/activeTimeEntry'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'
import { resolveEmbedded } from '@msw/utils/resolveEmbedded'
import { makeBusiness } from '@fixtures/business/mocks'

const encodeTimeEntry = Schema.encodeSync(TimeEntrySchema)
const decodeStartTracker = Schema.decodeUnknownSync(StartTrackerSchema)

const toResponse = (entry: TimeEntry) => apiData(encodeTimeEntry(entry))

const today = () => {
  const now = new Date()
  return new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export const post = createMockEndpoint<TimeEntry, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/time-tracking/tracker/start',
  resolve: async ({ override, request }) => {
    if (override) return toResponse(override)

    const existing = findActiveTimeEntry()
    if (existing != null) return toResponse(existing)

    const body = decodeStartTracker(await readRequestJson(request))
    const now = new Date()

    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      businessId: makeBusiness().id,
      externalId: null,
      date: today(),
      durationMinutes: 0,
      billable: body.billable ?? true,
      description: body.description ?? null,
      memo: body.memo ?? null,
      metadata: body.metadata ?? null,
      customer: resolveEmbedded({
        requestedId: body.customerId ?? null,
        fallback: null,
        lookup: id => customerStore.findById(id),
      }),
      service: resolveEmbedded({
        requestedId: body.serviceId,
        fallback: null,
        lookup: (id): TimeEntryService => {
          const stored = catalogServiceStore.findById(id)
          return stored != null ? toTimeEntryService(stored) : { id, name: null, billableRatePerHourAmount: null }
        },
      }),
      invoiceLineItem: null,
      status: 'ACTIVE',
      stoppedAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }

    timeEntryStore.save(entry)

    return toResponse(entry)
  },
})
