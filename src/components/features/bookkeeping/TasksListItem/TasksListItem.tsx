import { forwardRef } from 'react'

import { isCounterpartyAskTask, isLegacyBusinessTask, isUnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { CounterpartyAskTaskItem } from '@features/bookkeeping/TasksListItem/CounterpartyAskTaskItem'
import { LegacyTaskItem } from '@features/bookkeeping/TasksListItem/LegacyTaskItem'
import { UnifiedAskFormTaskItem } from '@features/bookkeeping/TasksListItem/UnifiedAskFormTaskItem'

type TasksListItemProps = {
  task: UserVisibleTask
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const TasksListItem = forwardRef<HTMLDivElement, TasksListItemProps>(({ task, ...props }, ref) => {
  if (isUnifiedAskFormTask(task)) return <UnifiedAskFormTaskItem ref={ref} task={task} {...props} />
  if (isCounterpartyAskTask(task)) return <CounterpartyAskTaskItem ref={ref} task={task} {...props} />
  if (isLegacyBusinessTask(task)) return <LegacyTaskItem ref={ref} task={task} {...props} />

  return null
})

TasksListItem.displayName = 'TasksListItem'
