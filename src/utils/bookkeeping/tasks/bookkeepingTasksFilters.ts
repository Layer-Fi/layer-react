import type { RawTask, TasksStatus } from '../../../types/tasks'

export function isIncompleteTask<T extends Pick<RawTask, 'status'>>(
  task: T,
): task is T & { status: 'TODO' } {
  const { status } = task

  return status === 'TODO'
}

export function getIncompleteTasks<T extends Pick<RawTask, 'status'>>(
  tasks: ReadonlyArray<T>,
) {
  return tasks.filter(task => isIncompleteTask(task))
}

type UserVisibleTaskStatus = Exclude<TasksStatus, 'COMPLETED' | 'ARCHIVED'>
export type UserVisibleTask = RawTask & { status: UserVisibleTaskStatus }

function isUserVisibleTask<T extends Pick<RawTask, 'status'>>(
  task: T,
): task is T & { status: UserVisibleTaskStatus } {
  const { status } = task

  return status !== 'COMPLETED' && status !== 'ARCHIVED'
}

export function getUserVisibleTasks<T extends Pick<RawTask, 'status'>>(
  tasks: ReadonlyArray<T>,
) {
  return tasks.filter(task => isUserVisibleTask(task))
}

type CompletedTaskStatus = Exclude<TasksStatus, 'TODO'>

export function isCompletedTask<T extends Pick<RawTask, 'status'>>(
  task: T,
): task is T & { status: CompletedTaskStatus } {
  const { status } = task

  return (
    status === 'USER_MARKED_COMPLETED'
    || status === 'COMPLETED'
    || status === 'ARCHIVED'
  )
}

export function getCompletedTasks<T extends Pick<RawTask, 'status'>>(
  tasks: ReadonlyArray<T>,
) {
  return tasks.filter(task => isCompletedTask(task))
}
