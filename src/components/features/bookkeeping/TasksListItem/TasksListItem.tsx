import { forwardRef, useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'

import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { isCompletedTask, type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import ChevronDownFill from '@icons/ChevronDownFill'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { P } from '@ui/Typography/Text'
import { getIconForTask } from '@features/bookkeeping/TasksListItem/getIconForTask'
import { LegacyTaskBody } from '@features/bookkeeping/TasksListItem/LegacyTaskBody'

type TasksListItemProps = {
  task: UserVisibleTask
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const TasksListItem = forwardRef<HTMLDivElement, TasksListItemProps>((
  { task, defaultOpen, onExpandTask },
  ref,
) => {
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.Tasks)
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const taskBodyClassName = classNames(
    'Layer__tasks-list-item__body',
    isOpen && 'Layer__tasks-list-item__body--expanded',
    isCompletedTask(task) && 'Layer__tasks-list-item--completed',
  )

  const taskHeadClassName = classNames(
    'Layer__tasks-list-item__head-info',
    isCompletedTask(task)
      ? 'Layer__tasks-list-item--completed'
      : 'Layer__tasks-list-item--pending',
  )

  const taskItemClassName = classNames(
    'Layer__tasks-list-item',
    isOpen && 'Layer__tasks-list-item__expanded',
  )

  useEffect(() => {
    setIsOpen(defaultOpen)
  }, [defaultOpen])

  const onClickTaskItemHead = useCallback(() => {
    emitLayerEvent({
      type: LayerEventType.TaskClicked,
      version: 1,
      payload: { taskId: task.id },
    })
    setIsOpen(!isOpen)
    onExpandTask?.(!isOpen)
  }, [isOpen, onExpandTask, emitLayerEvent, task.id])

  const onAnswered = useCallback(() => setIsOpen(false), [])

  return (
    <div className='Layer__tasks-list-item-wrapper' ref={ref}>
      <div className={taskItemClassName}>
        <div
          className='Layer__tasks-list-item__head'
          onClick={onClickTaskItemHead}
        >
          <div className={taskHeadClassName}>
            <div className='Layer__tasks-list-item__head-info__status'>
              {getIconForTask(task)}
            </div>
            <P variant='inherit'>{task.title}</P>
          </div>
          <ChevronDownFill
            size={16}
            className='Layer__tasks__expand-icon'
            style={{
              transform: isOpen ? 'rotate(0deg)' : 'rotate(-180deg)',
            }}
          />
        </div>
        <div className={taskBodyClassName}>
          <LegacyTaskBody task={task} onAnswered={onAnswered} />
        </div>
      </div>
    </div>
  )
})

TasksListItem.displayName = 'TasksListItem'
