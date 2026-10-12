import { type BusinessTask, isUnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTask'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'

export function isIncompleteTask<T extends Pick<BusinessTask, 'status'>>(
  task: T,
): task is T & { status: BusinessTaskStatus.Todo } {
  const { status } = task

  return status === BusinessTaskStatus.Todo
}

/** The first incomplete task after `currentId`, wrapping round to the start; never `currentId` itself. */
export function findNextIncompleteTask<T extends Pick<BusinessTask, 'id' | 'status'>>(
  tasks: ReadonlyArray<T>,
  currentId: string,
) {
  const index = tasks.findIndex(({ id }) => id === currentId)
  const wrapped = [...tasks.slice(index + 1), ...tasks.slice(0, Math.max(index, 0))]

  return wrapped.find(task => isIncompleteTask(task))
}

export function getIncompleteTasks<T extends Pick<BusinessTask, 'status'>>(
  tasks: ReadonlyArray<T>,
) {
  return tasks.filter(task => isIncompleteTask(task))
}

/** The unified ask form tasks among `tasks`. Which statuses to show is the API's decision, so this filters by type only. */
export function getUnifiedAskFormTasks<T extends BusinessTask>(
  tasks: ReadonlyArray<T>,
) {
  return tasks.filter(task => isUnifiedAskFormTask(task))
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
