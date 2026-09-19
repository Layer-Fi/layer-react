import { forwardRef, useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'

import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { isCounterpartyAskTask, isLegacyBusinessTask } from '@schemas/features/bookkeeping/businessTask'
import { isCompletedTask, type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import {
  type CounterpartyAskAnswerSummary,
  getStoredCounterpartyAskAnswerSummary,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'
import {
  type CounterpartyAskBackAction,
  CounterpartyAskTaskBody,
} from '@features/bookkeeping/TasksListItem/CounterpartyAskTaskBody'
import { LegacyTaskBody } from '@features/bookkeeping/TasksListItem/LegacyTaskBody'
import { TasksListItemHeader } from '@features/bookkeeping/TasksListItem/TasksListItemHeader'

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
  const [answer, setAnswer] = useState<CounterpartyAskAnswerSummary | null>(null)
  const [backAction, setBackAction] = useState<CounterpartyAskBackAction | null>(null)

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

  const isAsk = isCounterpartyAskTask(task)

  const taskBodyClassName = classNames(
    'Layer__tasks-list-item__body',
    isOpen && 'Layer__tasks-list-item__body--expanded',
    isAsk && 'Layer__tasks-list-item__body--flush',
    isCompletedTask(task) && 'Layer__tasks-list-item--completed',
  )

  return (
    <div className='Layer__tasks-list-item-wrapper' ref={ref}>
      <div className={classNames('Layer__tasks-list-item', isOpen && 'Layer__tasks-list-item__expanded')}>
        <TasksListItemHeader
          task={task}
          isOpen={isOpen}
          backAction={backAction}
          answer={answer ?? (isAsk ? getStoredCounterpartyAskAnswerSummary(task) : null)}
          onClick={onClickTaskItemHead}
        />
        <div className={taskBodyClassName}>
          {isCounterpartyAskTask(task)
            ? (
              <CounterpartyAskTaskBody
                task={task}
                counterpartyName={task.counterparty?.name ?? task.title}
                isExpanded={isOpen}
                onAnswerChange={setAnswer}
                onAnswered={onAnswered}
                onBackActionChange={setBackAction}
              />
            )
            : isLegacyBusinessTask(task)
              ? <LegacyTaskBody task={task} onAnswered={onAnswered} />
              : null}
        </div>
      </div>
    </div>
  )
})

TasksListItem.displayName = 'TasksListItem'
