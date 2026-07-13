import { Schema } from 'effect'

import { type BookkeepingStatusData, BookkeepingStatusDataSchema } from '@schemas/bookkeepingStatus'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'

const encodeBookkeepingStatus = Schema.encodeSync(BookkeepingStatusDataSchema)

const toResponse = (status: BookkeepingStatusData) => apiData(encodeBookkeepingStatus(status))

export const get = createMockEndpoint<BookkeepingStatusData, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bookkeeping/status',
  resolve: ({ override: status = makeBookkeepingStatus() }) => toResponse(status),
})
