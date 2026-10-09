import { forwardRef, useCallback } from 'react'
import classNames from 'classnames'

import { type UnifiedAskFormSubmissionResult } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmissionResult'
import { isCompletedTask, type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { TasksListItemHeader } from '@features/bookkeeping/TasksListItem/TasksListItemHeader'
import { useTasksListItemOpenState } from '@features/bookkeeping/TasksListItem/useTasksListItemOpenState'
import { UnifiedAskForm } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskForm'
import { useUnifiedAskForm } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { useUnifiedAskFormNavigation } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormNavigation'

type TasksListItemProps = {
  task: UserVisibleTask
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const TasksListItem = forwardRef<HTMLDivElement, TasksListItemProps>(({ task, defaultOpen, onExpandTask }, ref) => {
  const { eventCallbacks } = useLayerContext()
  const { isOpen, toggle, close } = useTasksListItemOpenState({ taskId: task.id, defaultOpen, onExpandTask })

  const onSaved = useCallback(({ categorized }: UnifiedAskFormSubmissionResult) => {
    if (categorized) eventCallbacks?.onTransactionCategorized?.()
    close()
  }, [close, eventCallbacks])

  const { form, isSubmitting } = useUnifiedAskForm({ task, onSaved })
  const navigation = useUnifiedAskFormNavigation({ task, form })

  const bodyClassName = classNames(
    'Layer__tasks-list-item__body',
    isOpen && 'Layer__tasks-list-item__body--expanded',
    isCompletedTask(task) && 'Layer__tasks-list-item--completed',
  )

  return (
    <div className='Layer__tasks-list-item-wrapper' ref={ref}>
      <div className={classNames('Layer__tasks-list-item', isOpen && 'Layer__tasks-list-item__expanded')}>
        <TasksListItemHeader
          task={task}
          isOpen={isOpen}
          onClick={toggle}
          backAction={navigation.canGoBack ? { isDisabled: isSubmitting || navigation.routing === 'loading', onBack: navigation.goBack } : null}
          answerSummary={task.answerSummary ?? null}
        />
        <div className={bodyClassName} aria-hidden={!isOpen}>
          <UnifiedAskForm task={task} form={form} navigation={navigation} isExpanded={isOpen} />
        </div>
      </div>
    </div>
  )
})

TasksListItem.displayName = 'TasksListItem'
