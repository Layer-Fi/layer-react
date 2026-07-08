import { Schema } from 'effect'

import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'

import { timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'
import { timeEntryFromCreateRequest } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/timeEntryFromUpsertRequest'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreCreateResolver } from '@msw/utils/createStoreResolvers'
import { makeTimeEntry } from '@fixtures/timeEntries/mocks'

const encodeTimeEntry = Schema.encodeSync(TimeEntrySchema)

export const toCreateTimeEntryResponse = (entry: TimeEntry) =>
  apiData(encodeTimeEntry(entry))

export const post = createMockEndpoint<TimeEntry, ReturnType<typeof toCreateTimeEntryResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/time-tracking/time-entries',
  resolve: createStoreCreateResolver({
    store: timeEntryStore,
    makeBase: id => makeTimeEntry({ id, status: 'RECORDED', service: null, customer: null, description: null, memo: null, externalId: null }),
    fromRequest: timeEntryFromCreateRequest,
    toResponse: toCreateTimeEntryResponse,
  }),
})
