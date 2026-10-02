import { Schema } from 'effect'

import { type BookkeepingPeriod, BookkeepingPeriodsSchema } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import {
  type BusinessTask,
  isAnyCounterpartyAskTask,
  isP2PCounterpartyAskTask,
} from '@schemas/features/bookkeeping/businessTask'

import { bookkeepingPeriodStore } from '@msw/api/businesses/[business-id]/bookkeeping/periods/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodePeriods = Schema.encodeSync(BookkeepingPeriodsSchema)

const applyTaskFilters = (
  periods: readonly BookkeepingPeriod[],
  request: Request,
): readonly BookkeepingPeriod[] => {
  const { searchParams } = new URL(request.url)
  const legacyTasksOnly = searchParams.get('legacy_tasks_only') !== 'false'
  const includePeerToPeerTasks = searchParams.get('include_peer_to_peer_tasks') === 'true'

  const isExcluded = (task: BusinessTask) =>
    (legacyTasksOnly && isAnyCounterpartyAskTask(task))
    || (!includePeerToPeerTasks && isP2PCounterpartyAskTask(task))

  return periods.map(period => ({
    ...period,
    tasks: period.tasks.filter(task => !isExcluded(task)),
  }))
}

const toResponse = (periods: readonly BookkeepingPeriod[], request: Request) =>
  apiData(encodePeriods({ periods: applyTaskFilters(periods, request) }))

export const get = createMockEndpoint<readonly BookkeepingPeriod[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bookkeeping/periods',
  resolve: ({ override: periods = bookkeepingPeriodStore.all(), request }) =>
    toResponse(periods, request),
})
