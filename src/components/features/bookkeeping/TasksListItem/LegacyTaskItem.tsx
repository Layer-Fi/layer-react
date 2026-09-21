import { forwardRef } from 'react'

import { type LegacyBusinessTask } from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { LegacyTaskBody } from '@features/bookkeeping/TasksListItem/LegacyTaskBody'
import { TasksListItemHeader } from '@features/bookkeeping/TasksListItem/TasksListItemHeader'
import { TasksListItemShell } from '@features/bookkeeping/TasksListItem/TasksListItemShell'
import { useTasksListItemOpenState } from '@features/bookkeeping/TasksListItem/useTasksListItemOpenState'

type LegacyTaskItemProps = {
  task: UserVisibleTask & LegacyBusinessTask
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const LegacyTaskItem = forwardRef<HTMLDivElement, LegacyTaskItemProps>((
  { task, defaultOpen, onExpandTask },
  ref,
) => {
  const { isOpen, toggle, close } = useTasksListItemOpenState({ taskId: task.id, defaultOpen, onExpandTask })

  return (
    <TasksListItemShell
      ref={ref}
      task={task}
      isOpen={isOpen}
      header={<TasksListItemHeader task={task} isOpen={isOpen} backAction={null} answer={null} onClick={toggle} />}
    >
      <LegacyTaskBody task={task} onAnswered={close} />
    </TasksListItemShell>
  )
})

LegacyTaskItem.displayName = 'LegacyTaskItem'
