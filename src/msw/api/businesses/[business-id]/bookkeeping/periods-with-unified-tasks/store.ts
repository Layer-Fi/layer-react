import { BookkeepingPeriodStatus } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { type BusinessTask, isUnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTask'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { getIncompleteTasks } from '@utils/features/bookkeeping/bookkeepingTasksFilters'

import { makeBookkeepingPeriods } from '@fixtures/bookkeeping/mocks'
import { PROFIT_AND_LOSS_FIXTURE_START_YEAR } from '@fixtures/profitAndLoss/constants'
import { createMockStore } from '@msw/utils/createMockStore'

export const bookkeepingPeriodStore = createMockStore(
  () => makeBookkeepingPeriods(PROFIT_AND_LOSS_FIXTURE_START_YEAR),
)

const isComplete = (tasks: readonly BusinessTask[]) => getIncompleteTasks(tasks).length === 0

export const findUnifiedAskFormTaskInStore = (taskId: string): UnifiedAskFormTask | undefined =>
  bookkeepingPeriodStore.all()
    .flatMap(({ tasks }) => tasks)
    .filter(isUnifiedAskFormTask)
    .find(task => task.id === taskId)

export const patchUnifiedAskFormTaskInStore = (
  taskId: string,
  applyPatch: (task: UnifiedAskFormTask) => UnifiedAskFormTask,
): UnifiedAskFormTask | undefined => {
  let patched: UnifiedAskFormTask | undefined

  const period = bookkeepingPeriodStore.all().find(({ tasks }) => tasks.some(task => task.id === taskId))

  if (!period) return undefined

  bookkeepingPeriodStore.patchById(period.id, (existing) => {
    const tasks = existing.tasks.map((task) => {
      if (task.id !== taskId || !isUnifiedAskFormTask(task)) return task

      patched = applyPatch(task)
      return patched
    })

    // Only transition status when task completion flips, so other patches keep statuses like CLOSING_IN_REVIEW.
    const status = isComplete(tasks) === isComplete(existing.tasks)
      ? existing.status
      : isComplete(tasks)
        ? BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER
        : BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER

    return { ...existing, tasks, status }
  })

  return patched
}
