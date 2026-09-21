import { type ComponentProps, forwardRef, type ReactNode } from 'react'
import classNames from 'classnames'

import { isCompletedTask, type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { TasksListItemHeader } from '@features/bookkeeping/TasksListItem/TasksListItemHeader'

type HeaderSlotProps = Pick<ComponentProps<typeof TasksListItemHeader>, 'backAction' | 'answer'>

type TasksListItemShellProps = {
  task: UserVisibleTask
  isOpen: boolean
  onToggle: () => void
  /** The body runs edge to edge instead of inside the item's padding. */
  isFlush?: boolean
  slotProps?: {
    Header?: Partial<HeaderSlotProps>
  }
  children: ReactNode
}

export const TasksListItemShell = forwardRef<HTMLDivElement, TasksListItemShellProps>((
  { task, isOpen, onToggle, isFlush = false, slotProps, children },
  ref,
) => {
  const bodyClassName = classNames(
    'Layer__tasks-list-item__body',
    isOpen && 'Layer__tasks-list-item__body--expanded',
    isFlush && 'Layer__tasks-list-item__body--flush',
    isCompletedTask(task) && 'Layer__tasks-list-item--completed',
  )

  return (
    <div className='Layer__tasks-list-item-wrapper' ref={ref}>
      <div className={classNames('Layer__tasks-list-item', isOpen && 'Layer__tasks-list-item__expanded')}>
        <TasksListItemHeader
          task={task}
          isOpen={isOpen}
          onClick={onToggle}
          backAction={null}
          answer={null}
          {...slotProps?.Header}
        />
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  )
})

TasksListItemShell.displayName = 'TasksListItemShell'
