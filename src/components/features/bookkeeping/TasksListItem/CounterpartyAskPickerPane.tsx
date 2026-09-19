import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type CounterpartyAskAccount } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import {
  MIX_ANSWER_KEY,
  OTHER_ANSWER_KEY,
  toSuggestionOptions,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'
import { type CounterpartyAskForm } from '@features/bookkeeping/TasksListItem/useCounterpartyAskForm'

type CounterpartyAskPickerPaneProps = {
  form: CounterpartyAskForm
  question: string
  suggestions: readonly CounterpartyAskAccount[]
  allowItemised: boolean
  onPick: (answerKey: string) => void
}

export const CounterpartyAskPickerPane = ({
  form,
  question,
  suggestions,
  allowItemised,
  onPick,
}: CounterpartyAskPickerPaneProps) => {
  const { t } = useTranslation()

  const escapeHatch = (label: string) => (
    <>
      {label}
      <ChevronRight size={15} />
    </>
  )

  const options = [
    ...toSuggestionOptions(suggestions),
    {
      value: OTHER_ANSWER_KEY,
      label: escapeHatch(t('bookkeeping:TasksListItem.CounterpartyAskPickerPane.action.something_else', 'Something else')),
    },
    ...(allowItemised
      ? [{
        value: MIX_ANSWER_KEY,
        label: escapeHatch(t(
          'bookkeeping:TasksListItem.CounterpartyAskPickerPane.action.multiple_different_things',
          'Multiple different things',
        )),
      }]
      : []),
  ]

  return (
    <VStack gap='sm' pb='md' pi='md'>
      <P size='sm'>{question}</P>
      <form.AppField name='answerKey'>
        {field => (
          <field.FormChipGroupField
            label={t('bookkeeping:TasksListItem.CounterpartyAskPickerPane.label.answer', 'What these were for')}
            showLabel={false}
            size='lg'
            options={options}
            onSelect={onPick}
          />
        )}
      </form.AppField>
    </VStack>
  )
}
