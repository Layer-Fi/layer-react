import { Schema } from 'effect'

import { type BookkeepingPeriod, BookkeepingPeriodsSchema } from '@schemas/bookkeepingPeriods'

import { bookkeepingPeriodStore } from '@msw/api/businesses/[business-id]/bookkeeping/periods/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodePeriods = Schema.encodeSync(BookkeepingPeriodsSchema)

const toResponse = (periods: readonly BookkeepingPeriod[]) =>
  apiData(encodePeriods({ periods }))

export const get = createMockEndpoint<readonly BookkeepingPeriod[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bookkeeping/periods',
  resolve: ({ override: periods = bookkeepingPeriodStore.all() }) => toResponse(periods),
})
