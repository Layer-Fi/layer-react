import { Schema } from 'effect'

import { type BookkeepingPeriod, BookkeepingPeriodsSchema } from '@schemas/features/bookkeeping/bookkeepingPeriods'

import { bookkeepingPeriodStore } from '@msw/api/businesses/[business-id]/bookkeeping/periods/store'
import { toUnifiedAskFormTask } from '@msw/api/businesses/[business-id]/tasks/unifiedAskFormTasks'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodePeriods = Schema.encodeSync(BookkeepingPeriodsSchema)

const toResponse = (periods: readonly BookkeepingPeriod[]) =>
  apiData(encodePeriods({
    periods: periods.map(period => ({ ...period, tasks: period.tasks.map(toUnifiedAskFormTask) })),
  }))

export const get = createMockEndpoint<readonly BookkeepingPeriod[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bookkeeping/periods-with-unified-tasks',
  resolve: ({ override: periods = bookkeepingPeriodStore.all() }) => toResponse(periods),
})
