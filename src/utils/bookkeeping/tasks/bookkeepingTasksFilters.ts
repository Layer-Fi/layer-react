import type { RawAutomatedTask, RawHumanTask, RawTask, TasksStatus } from '@internal-types/tasks'

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
export type UserVisibleHumanTask = RawHumanTask & { status: UserVisibleTaskStatus }
export type UserVisibleAutomatedTask = RawAutomatedTask & { status: UserVisibleTaskStatus }

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

export function isAutomatedTask(task: Pick<RawTask, 'task_type'>): task is RawAutomatedTask {
  return task.task_type === 'AUTOMATED'
}

export function isHumanTask(task: Pick<RawTask, 'task_type'>): task is RawHumanTask {
  return task.task_type === 'HUMAN'
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
