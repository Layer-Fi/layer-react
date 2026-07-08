import { Schema } from 'effect'

import { type TimeEntry, UpsertTimeEntrySchema } from '@schemas/timeTracking'

import { catalogServiceStore } from '@msw/api/businesses/[business-id]/catalog/services/store'
import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { readRequestJson } from '@msw/utils/request'
import { resolveEmbedded } from '@msw/utils/resolveEmbedded'

const decodeUpsert = Schema.decodeUnknownSync(Schema.partial(UpsertTimeEntrySchema.omit('metadata')))

export const timeEntryFromUpsertRequest = async (request: Request, base: TimeEntry): Promise<TimeEntry> => {
  const { serviceId, customerId, ...scalars } = decodeUpsert(await readRequestJson(request))

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
