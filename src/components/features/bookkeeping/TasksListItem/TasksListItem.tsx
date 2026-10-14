import { forwardRef, useCallback } from 'react'
import classNames from 'classnames'

import { type UnifiedAskFormSubmissionResult } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmissionResult'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { isCompletedTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { AnimatedElement } from '@components/utility/AnimatedElement/AnimatedElement'
import { TasksListItemHeader } from '@features/bookkeeping/TasksListItem/TasksListItemHeader'
import { useTasksListItemOpenState } from '@features/bookkeeping/TasksListItem/useTasksListItemOpenState'
import { UnifiedAskForm } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskForm'
import { useUnifiedAskForm } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { useUnifiedAskFormNavigation } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormNavigation'

type TasksListItemProps = {
  task: UnifiedAskFormTask
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const TasksListItem = forwardRef<HTMLDivElement, TasksListItemProps>(({ task, defaultOpen, onExpandTask }, ref) => {
  const { eventCallbacks } = useLayerContext()
  const { isOpen, toggle, open, close } = useTasksListItemOpenState({ taskId: task.id, defaultOpen, onExpandTask })

  const onSaved = useCallback(({ categorized }: UnifiedAskFormSubmissionResult) => {
    if (categorized) eventCallbacks?.onTransactionCategorized?.()
    close()
  }, [close, eventCallbacks])

  const { form, isSubmitting } = useUnifiedAskForm({ task, onSaved, onSaveFailed: open })
  const navigation = useUnifiedAskFormNavigation({ task, form })

  const bodyClassName = classNames(
    'Layer__tasks-list-item__body',
    isCompletedTask(task) && 'Layer__tasks-list-item--completed',
  )

  return (
    <AnimatedElement variant='collapse' className='Layer__tasks-list-item-wrapper' ref={ref}>
      <div className={classNames('Layer__tasks-list-item', isOpen && 'Layer__tasks-list-item__expanded')}>
        <TasksListItemHeader
          task={task}
          isOpen={isOpen}
          onClick={toggle}
          backAction={navigation.canGoBack ? { isDisabled: isSubmitting || navigation.routing === 'loading', onBack: navigation.goBack } : null}
        />
        <AnimatedElement variant='expand' isVisible={isOpen} className={bodyClassName} aria-hidden={!isOpen}>
          <UnifiedAskForm task={task} form={form} navigation={navigation} isExpanded={isOpen} />
        </AnimatedElement>
      </div>
    </AnimatedElement>
  )
})

TasksListItem.displayName = 'TasksListItem'
