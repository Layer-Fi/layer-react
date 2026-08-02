import { Schema } from 'effect'

import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'

import { timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'
import { timeEntryFromUpsertRequest } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/timeEntryFromUpsertRequest'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreUpdateResolver } from '@msw/utils/createStoreResolvers'
import { makeTimeEntry } from '@fixtures/timeEntries/mocks'

const encodeTimeEntry = Schema.encodeSync(TimeEntrySchema)

export const toUpdateTimeEntryResponse = (entry: TimeEntry) =>
  apiData(encodeTimeEntry(entry))

export const patch = createMockEndpoint<TimeEntry, ReturnType<typeof toUpdateTimeEntryResponse>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/time-tracking/time-entries/:timeEntryId',
  resolve: createStoreUpdateResolver({
    idParam: 'timeEntryId',
    store: timeEntryStore,
    makeBase: id => makeTimeEntry({ id, service: null }),
    fromRequest: timeEntryFromUpsertRequest,
    toResponse: toUpdateTimeEntryResponse,
  }),
})
