import type { RawAiTask, RawHumanTask, RawTask, TasksStatus } from '@internal-types/tasks'

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
export type UserVisibleAiTask = RawAiTask & { status: UserVisibleTaskStatus }

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

export function isAiTask(task: Pick<RawTask, 'type'>): task is RawAiTask {
  return task.type === 'AI_Task'
}

export function isHumanTask(task: Pick<RawTask, 'type'>): task is RawHumanTask {
  return task.type === 'Human_Task'
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
