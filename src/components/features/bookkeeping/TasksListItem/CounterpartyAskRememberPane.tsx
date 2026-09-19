import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type CounterpartyAskAccount } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { getCounterpartyAskAnswerLabel } from '@utils/features/bookkeeping/counterpartyAskAnswers'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'
import { getWholeAnswer } from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'
import { type CounterpartyAskForm } from '@features/bookkeeping/TasksListItem/useCounterpartyAskForm'

type CounterpartyAskRememberPaneProps = {
  form: CounterpartyAskForm
  suggestions: readonly CounterpartyAskAccount[]
  counterpartyName: string
}

export const CounterpartyAskRememberPane = ({ form, suggestions, counterpartyName }: CounterpartyAskRememberPaneProps) => {
  const { t } = useTranslation()
  const wholeAnswer = useStore(form.store, state => getWholeAnswer(suggestions, state.values))
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  if (!wholeAnswer) return null

  return (
    <VStack gap='md' pb='md' pi='md'>
      <P size='sm'>
        {t(
          'bookkeeping:TasksListItem.CounterpartyAskRememberPane.prompt.assume_going_forward',
          'Should we assume your future {{counterparty}} purchases are {{answer}} going forward?',
          { counterparty: counterpartyName, answer: getCounterpartyAskAnswerLabel(wholeAnswer) },
        )}
      </P>
      <form.AppField name='goingForward'>
        {field => (
          <field.FormChipGroupField
            label={t(
              'bookkeeping:TasksListItem.CounterpartyAskRememberPane.label.assume_going_forward',
              'Whether to assume this going forward',
            )}
            showLabel={false}
            size='lg'
            isDisabled={isSubmitting}
            options={[
              {
                value: 'always',
                label: t(
                  'bookkeeping:TasksListItem.CounterpartyAskRememberPane.action.yes_categorize_automatically',
                  'Yes, automatically categorize them',
                ),
              },
              {
                value: 'ask',
                label: t(
                  'bookkeeping:TasksListItem.CounterpartyAskRememberPane.action.no_keep_asking',
                  'No, keep asking me about them',
                ),
              },
            ]}
            onSelect={() => void form.handleSubmit()}
          />
        )}
      </form.AppField>
      {isSubmitting
        ? (
          <HStack align='center' gap='xs'>
            <LoadingSpinner size={14} />
            <Span size='xs' variant='subtle'>{t('common:state.saving', 'Saving...')}</Span>
          </HStack>
        )
        : null}
    </VStack>
  )
}
