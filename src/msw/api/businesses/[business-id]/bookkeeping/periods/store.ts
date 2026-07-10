import { BookkeepingPeriodStatus } from '@schemas/bookkeepingPeriods'
import { type BusinessTask, BusinessTaskStatus } from '@schemas/businessTasks/businessTask'

import { createMockStore } from '@msw/utils/createMockStore'
import { makeBookkeepingPeriods } from '@fixtures/bookkeeping/mocks'
import { PROFIT_AND_LOSS_FIXTURE_START_YEAR } from '@fixtures/profitAndLoss/constants'

export const bookkeepingPeriodStore = createMockStore(
  () => makeBookkeepingPeriods(PROFIT_AND_LOSS_FIXTURE_START_YEAR),
)

export const completeTaskInStore = (taskId: string, userResponse: string | null): BusinessTask | undefined => {
  let completed: BusinessTask | undefined

  bookkeepingPeriodStore.all().forEach((period) => {
    if (!period.tasks.some(task => task.id === taskId)) return

    bookkeepingPeriodStore.patchById(period.id, (existing) => {
      const tasks = existing.tasks.map((task) => {
        if (task.id !== taskId) return task

        completed = { ...task, status: BusinessTaskStatus.UserMarkedCompleted, userResponse }
        return completed
      })

      const allTasksComplete = tasks.every(task => task.status !== BusinessTaskStatus.Todo)

      return {
        ...existing,
        tasks,
        status: allTasksComplete ? BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER : existing.status,
      }
    })
  })

  return completed
}
