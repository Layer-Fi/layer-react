import { Schema } from 'effect'

import { type BookkeepingPeriod, BookkeepingPeriodsSchema } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { isCounterpartyAskTask } from '@schemas/features/bookkeeping/businessTask'

import { bookkeepingPeriodStore } from '@msw/api/businesses/[business-id]/bookkeeping/periods/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodePeriods = Schema.encodeSync(BookkeepingPeriodsSchema)

const applyLegacyTasksOnly = (
  periods: readonly BookkeepingPeriod[],
  request: Request,
): readonly BookkeepingPeriod[] => {
  const legacyTasksOnly = new URL(request.url).searchParams.get('legacy_tasks_only') !== 'false'

  if (!legacyTasksOnly) return periods

  return periods.map(period => ({
    ...period,
    tasks: period.tasks.filter(task => !isCounterpartyAskTask(task)),
  }))
}

const toResponse = (periods: readonly BookkeepingPeriod[], request: Request) =>
  apiData(encodePeriods({ periods: applyLegacyTasksOnly(periods, request) }))

export const get = createMockEndpoint<readonly BookkeepingPeriod[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bookkeeping/periods',
  resolve: ({ override: periods = bookkeepingPeriodStore.all(), request }) =>
    toResponse(periods, request),
})
