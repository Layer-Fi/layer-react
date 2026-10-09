import { forwardRef, useCallback, useState } from 'react'

import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { TasksListItemShell } from '@features/bookkeeping/TasksListItem/TasksListItemShell'
import { useTasksListItemOpenState } from '@features/bookkeeping/TasksListItem/useTasksListItemOpenState'
import { UnifiedAskForm } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskForm'
import { type UnifiedAskFormSaved, useUnifiedAskForm } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { useUnifiedAskFormNavigation } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormNavigation'

type UnifiedAskFormTaskItemProps = {
  task: UserVisibleTask & UnifiedAskFormTask
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const UnifiedAskFormTaskItem = forwardRef<HTMLDivElement, UnifiedAskFormTaskItemProps>((
  { task, defaultOpen, onExpandTask },
  ref,
) => {
  const { eventCallbacks } = useLayerContext()
  const { isOpen, toggle, close } = useTasksListItemOpenState({ taskId: task.id, defaultOpen, onExpandTask })
  const [savedSummary, setSavedSummary] = useState<string | null>(null)

  const onSaved = useCallback(({ answerSummary, categorized }: UnifiedAskFormSaved) => {
    if (categorized) {
      eventCallbacks?.onTransactionCategorized?.()
    }

    setSavedSummary(answerSummary)
    close()
  }, [close, eventCallbacks])

  const { form, isSubmitting } = useUnifiedAskForm({ task, onSaved })
  const navigation = useUnifiedAskFormNavigation({ task, form })
  const answerSummary = savedSummary ?? task.answerSummary

  return (
    <TasksListItemShell
      ref={ref}
      task={task}
      isOpen={isOpen}
      onToggle={toggle}
      isFlush
      slotProps={{
        Header: {
          backAction: navigation.canGoBack ? { isDisabled: isSubmitting || navigation.routing === 'loading', onBack: navigation.goBack } : null,
          answer: answerSummary ? { kind: 'account', name: answerSummary } : null,
        },
      }}
    >
      <UnifiedAskForm task={task} form={form} navigation={navigation} isExpanded={isOpen} />
    </TasksListItemShell>
  )
})

UnifiedAskFormTaskItem.displayName = 'UnifiedAskFormTaskItem'
