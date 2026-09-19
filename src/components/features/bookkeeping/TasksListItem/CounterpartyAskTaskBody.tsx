import { useCallback, useEffect } from 'react'
import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { SlidingPanes } from '@components/utility/SlidingPanes/SlidingPanes'
import { VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import {
  type CounterpartyAskAnswerSummary,
  MIX_ANSWER_KEY,
  OTHER_ANSWER_KEY,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'
import { CounterpartyAskFreeTextPane } from '@features/bookkeeping/TasksListItem/CounterpartyAskFreeTextPane'
import { CounterpartyAskItemisedPane } from '@features/bookkeeping/TasksListItem/CounterpartyAskItemisedPane'
import { CounterpartyAskPickerPane } from '@features/bookkeeping/TasksListItem/CounterpartyAskPickerPane'
import { CounterpartyAskRememberPane } from '@features/bookkeeping/TasksListItem/CounterpartyAskRememberPane'
import {
  type CounterpartyAskSaved,
  useCounterpartyAskForm,
} from '@features/bookkeeping/TasksListItem/useCounterpartyAskForm'
import { useCounterpartyAskNavigation } from '@features/bookkeeping/TasksListItem/useCounterpartyAskNavigation'

import './counterpartyAskTaskBody.scss'

export type CounterpartyAskBackAction = {
  isDisabled: boolean
  onBack: () => void
}

type CounterpartyAskTaskBodyProps = {
  task: UserVisibleTask & CounterpartyAskTask
  counterpartyName: string
  isExpanded: boolean
  onAnswerChange: (answer: CounterpartyAskAnswerSummary | null) => void
  onAnswered: () => void
  onBackActionChange: (backAction: CounterpartyAskBackAction | null) => void
}

export const CounterpartyAskTaskBody = ({
  task,
  counterpartyName,
  isExpanded,
  onAnswerChange,
  onAnswered,
  onBackActionChange,
}: CounterpartyAskTaskBodyProps) => {
  const { t } = useTranslation()
  const { eventCallbacks } = useLayerContext()
  const { view, direction, canGoBack, goForward, goBack, returnToPicker } = useCounterpartyAskNavigation()

  const onSaved = useCallback(({ answer, wasCategorized }: CounterpartyAskSaved) => {
    if (wasCategorized) {
      eventCallbacks?.onTransactionCategorized?.()
    }

    onAnswerChange(answer)
    returnToPicker()
    onAnswered()
  }, [eventCallbacks, onAnswerChange, onAnswered, returnToPicker])

  const { form } = useCounterpartyAskForm({ task, onSaved })
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  useEffect(() => {
    onBackActionChange(canGoBack ? { isDisabled: isSubmitting, onBack: goBack } : null)

    return () => onBackActionChange(null)
  }, [canGoBack, goBack, isSubmitting, onBackActionChange])

  const onPick = useCallback((answerKey: string) => {
    if (answerKey === MIX_ANSWER_KEY) goForward('itemised')
    else if (answerKey === OTHER_ANSWER_KEY) goForward('freeText')
    else goForward('remember')
  }, [goForward])

  if (task.resolvedByTaskId) {
    return (
      <VStack pb='md' pi='md'>
        <P size='sm' variant='subtle'>
          {t(
            'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_elsewhere_detail',
            'You answered this for every period, so we’ve applied it here too.',
          )}
        </P>
      </VStack>
    )
  }

  const { suggestions, transactions } = task

  const panes = {
    picker: (
      <CounterpartyAskPickerPane
        form={form}
        question={task.question}
        suggestions={suggestions}
        allowItemised={transactions.length > 1}
        onPick={onPick}
      />
    ),
    freeText: <CounterpartyAskFreeTextPane form={form} onContinue={() => goForward('remember')} />,
    itemised: (
      <CounterpartyAskItemisedPane
        form={form}
        transactions={transactions}
        suggestions={suggestions}
        onUniformAnswer={() => goForward('remember')}
      />
    ),
    remember: <CounterpartyAskRememberPane form={form} suggestions={suggestions} counterpartyName={counterpartyName} />,
  }

  return (
    <SlidingPanes className='Layer__CounterpartyAskTask' paneKey={view} direction={direction} keepInView={isExpanded}>
      {panes[view]}
    </SlidingPanes>
  )
}
