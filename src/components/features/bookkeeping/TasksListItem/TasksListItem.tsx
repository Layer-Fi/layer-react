import { forwardRef, useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { isCounterpartyAskTask, isLegacyBusinessTask } from '@schemas/features/bookkeeping/businessTask'
import { isCompletedTask, type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import ChevronDownFill from '@icons/ChevronDownFill'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { Button } from '@ui/Button/Button'
import { P } from '@ui/Typography/Text'
import {
  type CounterpartyAskBackAction,
  CounterpartyAskTaskBody,
} from '@features/bookkeeping/TasksListItem/CounterpartyAskTaskBody'
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
  const { t } = useTranslation()
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.Tasks)
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [answeredLabel, setAnsweredLabel] = useState<string | null>(null)
  const [backAction, setBackAction] = useState<CounterpartyAskBackAction | null>(null)

  const taskBodyClassName = classNames(
    'Layer__tasks-list-item__body',
    isOpen && 'Layer__tasks-list-item__body--expanded',
    isCounterpartyAskTask(task) && 'Layer__tasks-list-item__body--flush',
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
            {isOpen && backAction
              ? (
                <Button
                  className='Layer__tasks-list-item__head-info__back'
                  variant='outlined'
                  icon
                  isDisabled={backAction.isDisabled}
                  onPress={backAction.onBack}
                  aria-label={t('common:action.back', 'Back')}
                >
                  <ChevronLeft size={14} />
                </Button>
              )
              : (
                <div className='Layer__tasks-list-item__head-info__status'>
                  {getIconForTask(task)}
                </div>
              )}
            <P variant='inherit'>{task.title}</P>
            {answeredLabel ? <P size='sm' variant='subtle'>{answeredLabel}</P> : null}
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
          {isCounterpartyAskTask(task)
            ? (
              <CounterpartyAskTaskBody
                task={task}
                counterpartyName={task.counterparty?.name ?? task.title}
                onAnsweredLabelChange={setAnsweredLabel}
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
