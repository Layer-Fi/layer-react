import { forwardRef } from 'react'

import { isCounterpartyAskTask, isLegacyBusinessTask } from '@schemas/features/bookkeeping/businessTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { CounterpartyAskTaskItem } from '@features/bookkeeping/TasksListItem/CounterpartyAskTaskItem'
import { LegacyTaskItem } from '@features/bookkeeping/TasksListItem/LegacyTaskItem'

type TasksListItemProps = {
  task: UserVisibleTask
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const TasksListItem = forwardRef<HTMLDivElement, TasksListItemProps>(({ task, ...props }, ref) => {
  if (isCounterpartyAskTask(task)) return <CounterpartyAskTaskItem ref={ref} task={task} {...props} />
  if (isLegacyBusinessTask(task)) return <LegacyTaskItem ref={ref} task={task} {...props} />

  return null
})

TasksListItem.displayName = 'TasksListItem'
