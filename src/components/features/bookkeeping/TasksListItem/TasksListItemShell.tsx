import { forwardRef, type ReactNode } from 'react'
import classNames from 'classnames'

import { isCompletedTask, type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'

type TasksListItemShellProps = {
  task: UserVisibleTask
  isOpen: boolean
  /** The body runs edge to edge instead of inside the item's padding. */
  isFlush?: boolean
  header: ReactNode
  children: ReactNode
}

export const TasksListItemShell = forwardRef<HTMLDivElement, TasksListItemShellProps>((
  { task, isOpen, isFlush = false, header, children },
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
        {header}
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  )
})

TasksListItemShell.displayName = 'TasksListItemShell'
