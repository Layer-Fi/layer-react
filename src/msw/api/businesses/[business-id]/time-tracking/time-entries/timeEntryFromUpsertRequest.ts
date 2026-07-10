import { Schema } from 'effect'

import { type TimeEntry, type UpsertTimeEntry, UpsertTimeEntrySchema } from '@schemas/timeTracking'

import { catalogServiceStore } from '@msw/api/businesses/[business-id]/catalog/services/store'
import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { readRequestJson } from '@msw/utils/request'
import { resolveEmbedded } from '@msw/utils/resolveEmbedded'

const UpsertBodySchema = UpsertTimeEntrySchema.omit('metadata')

const decodeCreateBody = Schema.decodeUnknownSync(UpsertBodySchema)
const decodeUpdateBody = Schema.decodeUnknownSync(Schema.partial(UpsertBodySchema))

const timeEntryFromBody = (
  { serviceId, customerId, ...scalars }: Partial<Omit<UpsertTimeEntry, 'metadata'>>,
  base: TimeEntry,
): TimeEntry => {
  const service = resolveEmbedded({
    requestedId: serviceId,
    fallback: base.service ?? null,
    lookup: id => catalogServiceStore.findById(id),
  })

  const customer = resolveEmbedded({
    requestedId: customerId,
    fallback: base.customer ?? null,
    lookup: id => customerStore.findById(id),
  })

  return { ...base, ...scalars, service, customer, updatedAt: new Date() }
}

export const timeEntryFromCreateRequest = async (request: Request, base: TimeEntry): Promise<TimeEntry> =>
  timeEntryFromBody(decodeCreateBody(await readRequestJson(request)), base)

export const timeEntryFromUpsertRequest = async (request: Request, base: TimeEntry): Promise<TimeEntry> =>
  timeEntryFromBody(decodeUpdateBody(await readRequestJson(request)), base)
