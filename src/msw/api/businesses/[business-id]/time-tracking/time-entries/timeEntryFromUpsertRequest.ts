import { parseDate } from '@internationalized/date'

import { type CatalogService } from '@schemas/catalogService'
import { type TimeEntry, type TimeEntryService } from '@schemas/timeTracking'

import { catalogServiceStore } from '@msw/api/businesses/[business-id]/catalog/services/store'
import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { readRequestJson } from '@msw/utils/request'
import { resolveEmbedded } from '@msw/utils/resolveEmbedded'

export const toTimeEntryService = (service: CatalogService): TimeEntryService => ({
  id: service.id,
  name: service.name,
  billableRatePerHourAmount: service.billableRatePerHourAmount,
})

export const timeEntryFromUpsertRequest = async (request: Request, base: TimeEntry): Promise<TimeEntry> => {
  const body = await readRequestJson(request) as Record<string, unknown>

  const service = resolveEmbedded(
    body.service_id as string | null | undefined,
    base.service ?? null,
    (id): TimeEntryService => {
      const stored = catalogServiceStore.findById(id)
      return stored != null ? toTimeEntryService(stored) : { id, name: null, billableRatePerHourAmount: null }
    },
  )

  const customer = resolveEmbedded(
    body.customer_id as string | null | undefined,
    base.customer ?? null,
    id => customerStore.findById(id) ?? base.customer ?? null,
  )

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
