import { BookkeepingPeriodStatus } from '@schemas/bookkeepingPeriods'
import { type BusinessTask, BusinessTaskStatus } from '@schemas/businessTasks/businessTask'

import { createMockStore } from '@msw/utils/createMockStore'
import { makeBookkeepingPeriods } from '@fixtures/bookkeeping/mocks'
import { PROFIT_AND_LOSS_FIXTURE_START_YEAR } from '@fixtures/profitAndLoss/constants'

export const bookkeepingPeriodStore = createMockStore(
  () => makeBookkeepingPeriods(PROFIT_AND_LOSS_FIXTURE_START_YEAR),
)

export const patchTaskInStore = (
  taskId: string,
  applyPatch: (task: BusinessTask) => BusinessTask,
): BusinessTask | undefined => {
  let patched: BusinessTask | undefined

  bookkeepingPeriodStore.all().forEach((period) => {
    if (!period.tasks.some(task => task.id === taskId)) return

    bookkeepingPeriodStore.patchById(period.id, (existing) => {
      const tasks = existing.tasks.map((task) => {
        if (task.id !== taskId) return task

        patched = applyPatch(task)
        return patched
      })

      const isComplete = (periodTasks: readonly BusinessTask[]) =>
        periodTasks.every(task => task.status !== BusinessTaskStatus.Todo)

      const wasComplete = isComplete(existing.tasks)
      const nowComplete = isComplete(tasks)

      // Only transition status when task completion actually flips, so
      // metadata-only patches don't clobber statuses like CLOSING_IN_REVIEW.
      const status = nowComplete === wasComplete
        ? existing.status
        : nowComplete
          ? BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER
          : BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER

      return { ...existing, tasks, status }
    })
  })

  return patched
}

export const completeTaskInStore = (taskId: string, userResponse: string | null): BusinessTask | undefined =>
  patchTaskInStore(taskId, task => ({
    ...task,
    status: BusinessTaskStatus.UserMarkedCompleted,
    userResponse,
  }))
