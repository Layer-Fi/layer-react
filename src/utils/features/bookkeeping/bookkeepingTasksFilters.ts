import { type BusinessTask, isRenderableBusinessTask } from '@schemas/features/bookkeeping/businessTask'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type LegacyBusinessTask } from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'

export function isIncompleteTask<T extends Pick<BusinessTask, 'status'>>(
  task: T,
): task is T & { status: BusinessTaskStatus.Todo } {
  const { status } = task

  return status === BusinessTaskStatus.Todo
}

export function getIncompleteTasks<T extends Pick<BusinessTask, 'status'>>(
  tasks: ReadonlyArray<T>,
) {
  return tasks.filter(task => isIncompleteTask(task))
}

type UserVisibleTaskStatus = Exclude<BusinessTaskStatus, BusinessTaskStatus.Completed | BusinessTaskStatus.Archived>
type RenderableBusinessTask = LegacyBusinessTask
export type UserVisibleTask = RenderableBusinessTask & { status: UserVisibleTaskStatus }

function isUserVisibleTask<T extends BusinessTask>(
  task: T,
): task is T & RenderableBusinessTask & { status: UserVisibleTaskStatus } {
  const { status } = task

  if (!isRenderableBusinessTask(task)) return false

  return status !== BusinessTaskStatus.Completed && status !== BusinessTaskStatus.Archived
}

export function getUserVisibleTasks<T extends BusinessTask>(
  tasks: ReadonlyArray<T>,
) {
  return tasks.filter(task => isUserVisibleTask(task))
}

type CompletedTaskStatus = Exclude<BusinessTaskStatus, BusinessTaskStatus.Todo>

export function isCompletedTask<T extends Pick<BusinessTask, 'status'>>(
  task: T,
): task is T & { status: CompletedTaskStatus } {
  const { status } = task

  return (
    status === BusinessTaskStatus.UserMarkedCompleted
    || status === BusinessTaskStatus.Completed
    || status === BusinessTaskStatus.Archived
  )
}

export function getCompletedTasks<T extends Pick<BusinessTask, 'status'>>(
  tasks: ReadonlyArray<T>,
) {
  return tasks.filter(task => isCompletedTask(task))
}
