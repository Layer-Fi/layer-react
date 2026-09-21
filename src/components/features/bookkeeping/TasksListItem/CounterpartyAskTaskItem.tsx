import { forwardRef, useCallback, useState } from 'react'
import { useStore } from '@tanstack/react-form'

import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import {
  type CounterpartyAskAnswerSummary,
  getStoredCounterpartyAskAnswerSummary,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'
import { CounterpartyAskTaskBody } from '@features/bookkeeping/TasksListItem/CounterpartyAskTaskBody'
import { TasksListItemShell } from '@features/bookkeeping/TasksListItem/TasksListItemShell'
import {
  type CounterpartyAskSaved,
  useCounterpartyAskForm,
} from '@features/bookkeeping/TasksListItem/useCounterpartyAskForm'
import { useCounterpartyAskNavigation } from '@features/bookkeeping/TasksListItem/useCounterpartyAskNavigation'
import { useTasksListItemOpenState } from '@features/bookkeeping/TasksListItem/useTasksListItemOpenState'

type CounterpartyAskTaskItemProps = {
  task: UserVisibleTask & CounterpartyAskTask
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const CounterpartyAskTaskItem = forwardRef<HTMLDivElement, CounterpartyAskTaskItemProps>((
  { task, defaultOpen, onExpandTask },
  ref,
) => {
  const { eventCallbacks } = useLayerContext()
  const { isOpen, toggle, close } = useTasksListItemOpenState({ taskId: task.id, defaultOpen, onExpandTask })
  const navigation = useCounterpartyAskNavigation()
  const [savedAnswer, setSavedAnswer] = useState<CounterpartyAskAnswerSummary | null>(null)

  const onSaved = useCallback(({ answer, wasCategorized }: CounterpartyAskSaved) => {
    if (wasCategorized) {
      eventCallbacks?.onTransactionCategorized?.()
    }

    setSavedAnswer(answer)
    navigation.returnToPicker()
    close()
  }, [close, eventCallbacks, navigation])

  const { form } = useCounterpartyAskForm({ task, onSaved, onRowsReset: navigation.returnToPicker })
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  return (
    <TasksListItemShell
      ref={ref}
      task={task}
      isOpen={isOpen}
      onToggle={toggle}
      isFlush
      slotProps={{
        Header: {
          backAction: navigation.canGoBack ? { isDisabled: isSubmitting, onBack: navigation.goBack } : null,
          answer: savedAnswer ?? getStoredCounterpartyAskAnswerSummary(task),
        },
      }}
    >
      <CounterpartyAskTaskBody
        task={task}
        form={form}
        navigation={navigation}
        counterpartyName={task.counterparty?.name ?? task.title}
        isExpanded={isOpen}
      />
    </TasksListItemShell>
  )
})

CounterpartyAskTaskItem.displayName = 'CounterpartyAskTaskItem'
