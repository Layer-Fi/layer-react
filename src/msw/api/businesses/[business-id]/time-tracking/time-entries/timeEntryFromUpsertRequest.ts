import { parseDate } from '@internationalized/date'

import { type CatalogService } from '@schemas/catalogService'
import { type TimeEntry, type TimeEntryService } from '@schemas/timeTracking'

import { catalogServiceStore } from '@msw/api/businesses/[business-id]/catalog/services/store'
import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { readRequestJson } from '@msw/utils/request'

/** The lightweight service view embedded on a time entry. */
export const toTimeEntryService = (service: CatalogService): TimeEntryService => ({
  id: service.id,
  name: service.name,
  billableRatePerHourAmount: service.billableRatePerHourAmount,
})

/*
 * Builds a stored time entry from an upsert body, resolving the referenced
 * customer and service against their stores. Any field absent from the body
 * (partial PATCH updates) falls back to the existing entry.
 */
export const timeEntryFromUpsertRequest = async (request: Request, base: TimeEntry): Promise<TimeEntry> => {
  const body = await readRequestJson(request) as Record<string, unknown>

  const serviceId = body.service_id as string | undefined
  const storedService = serviceId != null ? catalogServiceStore.findById(serviceId) : undefined
  const service: TimeEntryService | null = serviceId == null
    ? base.service ?? null
    : storedService != null
      ? toTimeEntryService(storedService)
      : { id: serviceId, name: null, billableRatePerHourAmount: null }

  const customerId = body.customer_id as string | null | undefined
  const customer = customerId === undefined
    ? base.customer
    : customerId == null
      ? null
      : customerStore.findById(customerId) ?? base.customer

  return {
    ...base,
    service,
    customer,
    date: typeof body.date === 'string' ? parseDate(body.date) : base.date,
    durationMinutes: typeof body.duration_minutes === 'number' ? body.duration_minutes : base.durationMinutes,
    billable: typeof body.billable === 'boolean' ? body.billable : base.billable,
    description: 'description' in body ? (body.description as string | null) : base.description,
    memo: 'memo' in body ? (body.memo as string | null) : base.memo,
    externalId: 'external_id' in body ? (body.external_id as string | null) : base.externalId,
    updatedAt: new Date(),
  }
}
