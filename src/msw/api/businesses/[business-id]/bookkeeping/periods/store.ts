import { BookkeepingPeriodStatus } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import {
  type BusinessTask,
  isCounterpartyAskTask,
  isLegacyBusinessTask,
  isUnifiedAskFormTask,
} from '@schemas/features/bookkeeping/businessTask'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { type LegacyBusinessTask } from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

import { makeBookkeepingPeriods } from '@fixtures/bookkeeping/mocks'
import { PROFIT_AND_LOSS_FIXTURE_START_YEAR } from '@fixtures/profitAndLoss/constants'
import { createMockStore } from '@msw/utils/createMockStore'

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

// Returns undefined for a task of another kind so callers fall back rather
// than reporting success for a patch that never applied.
const patchTaskOfKindInStore = <T extends BusinessTask>(
  taskId: string,
  isKind: (task: BusinessTask) => task is T,
  applyPatch: (task: T) => T,
): T | undefined => {
  let patched: T | undefined

  patchTaskInStore(taskId, (task) => {
    if (!isKind(task)) return task

    patched = applyPatch(task)
    return patched
  })

  return patched
}

export const patchLegacyTaskInStore = (
  taskId: string,
  applyPatch: (task: LegacyBusinessTask) => LegacyBusinessTask,
) => patchTaskOfKindInStore(taskId, isLegacyBusinessTask, applyPatch)

export const patchCounterpartyAskTaskInStore = (
  taskId: string,
  applyPatch: (task: CounterpartyAskTask) => CounterpartyAskTask,
) => patchTaskOfKindInStore(taskId, isCounterpartyAskTask, applyPatch)

export const patchUnifiedAskFormTaskInStore = (
  taskId: string,
  applyPatch: (task: UnifiedAskFormTask) => UnifiedAskFormTask,
) => patchTaskOfKindInStore(taskId, isUnifiedAskFormTask, applyPatch)

export const findTaskInStore = (taskId: string): BusinessTask | undefined =>
  bookkeepingPeriodStore.all().flatMap(period => period.tasks).find(task => task.id === taskId)

export const completeTaskInStore = (taskId: string, userResponse: string | null): BusinessTask | undefined =>
  patchLegacyTaskInStore(taskId, task => ({
    ...task,
    status: BusinessTaskStatus.UserMarkedCompleted,
    userResponse,
  }))

const resolveCounterpartyAskSiblings = (answeringTask: CounterpartyAskTask) => {
  const counterpartyId = answeringTask.counterparty?.id

  if (!counterpartyId) return

  const openSiblingIds = bookkeepingPeriodStore.all()
    .flatMap(period => period.tasks)
    .filter(task =>
      task.id !== answeringTask.id
      && isCounterpartyAskTask(task)
      && task.counterparty?.id === counterpartyId
      && task.status === BusinessTaskStatus.Todo,
    )
    .map(task => task.id)

  openSiblingIds.forEach((siblingId) => {
    patchCounterpartyAskTaskInStore(siblingId, sibling => ({
      ...sibling,
      status: BusinessTaskStatus.UserMarkedCompleted,
      resolvedByTaskId: answeringTask.id,
      responseAccount: answeringTask.responseAccount,
    }))
  })
}

const reopenCounterpartyAskSiblings = (answeringTaskId: string) => {
  const resolvedSiblingIds = bookkeepingPeriodStore.all()
    .flatMap(period => period.tasks)
    .filter(task => isCounterpartyAskTask(task) && task.resolvedByTaskId === answeringTaskId)
    .map(task => task.id)

  resolvedSiblingIds.forEach((siblingId) => {
    patchCounterpartyAskTaskInStore(siblingId, sibling => ({
      ...sibling,
      status: BusinessTaskStatus.Todo,
      resolvedByTaskId: null,
      responseAccount: null,
    }))
  })
}

export const syncCounterpartyAskSiblings = (answeringTask: CounterpartyAskTask) => {
  if (answeringTask.alwaysThis && answeringTask.responseAccount) {
    resolveCounterpartyAskSiblings(answeringTask)
    return
  }

  reopenCounterpartyAskSiblings(answeringTask.id)
}
