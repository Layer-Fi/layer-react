import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type CounterpartyAskAccount } from '@schemas/features/bookkeeping/businessTasks/baseCounterpartyAskTask'
import { getCounterpartyAskAnswerLabel } from '@utils/features/bookkeeping/counterpartyAskAnswers'
import { tConditional } from '@utils/shared/i18n/conditional'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'
import { withForm } from '@blocks/Form/useForm'
import {
  type CounterpartyAskCounterparty,
  counterpartyAskFormOptions,
  getWholeAnswer,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'

type GoingForwardPromptCondition = 'purchase' | 'p2p' | 'p2pWithProvider' | 'p2pUnnamed' | 'p2pUnnamedWithProvider'

const toGoingForwardPromptCondition = (counterparty: CounterpartyAskCounterparty): GoingForwardPromptCondition => {
  if (counterparty.kind !== 'p2p') return 'purchase'
  if (!counterparty.name) return counterparty.providerName ? 'p2pUnnamedWithProvider' : 'p2pUnnamed'

  return counterparty.providerName ? 'p2pWithProvider' : 'p2p'
}

export const CounterpartyAskRememberPane = withForm({
  ...counterpartyAskFormOptions,
  props: {
    suggestions: [] as readonly CounterpartyAskAccount[],
    counterparty: { kind: 'purchase', name: '' } as CounterpartyAskCounterparty,
  },
  render: function Render({ form, suggestions, counterparty }) {
    const { t } = useTranslation()
    const wholeAnswer = useStore(form.store, state => getWholeAnswer(suggestions, state.values))
    const isSubmitting = useStore(form.store, state => state.isSubmitting)

    if (!wholeAnswer) return null

    const answer = getCounterpartyAskAnswerLabel(wholeAnswer)
    const prompt = tConditional(t, 'bookkeeping:TasksListItem.CounterpartyAskRememberPane.prompt.remember_going_forward', {
      condition: toGoingForwardPromptCondition(counterparty),
      cases: {
        purchase: 'Should we assume your future {{counterparty}} purchases are {{answer}} going forward?',
        p2p: 'Should we assume your future payments to {{counterparty}} are {{answer}} going forward?',
        p2pWithProvider: 'Should we assume your future {{provider}} payments to {{counterparty}} are {{answer}} going forward?',
        p2pUnnamed: 'Should we assume future payments like these are {{answer}} going forward?',
        p2pUnnamedWithProvider: 'Should we assume your future {{provider}} payments are {{answer}} going forward?',
      },
      contexts: {
        purchase: 'purchase',
        p2p: 'p2p',
        p2pWithProvider: 'p2p_with_provider',
        p2pUnnamed: 'p2p_unnamed',
        p2pUnnamedWithProvider: 'p2p_unnamed_with_provider',
      },
      counterparty: counterparty.name,
      provider: counterparty.kind === 'p2p' ? counterparty.providerName : null,
      answer,
    })

    return (
      <form.FormGroup
        name='remember'
        validators={{
          onDynamic: ({ value }) => (value.goingForward
            ? undefined
            : {
              fields: {
                goingForward: t(
                  'bookkeeping:TasksListItem.CounterpartyAskRememberPane.validation.choice_required',
                  'Choose whether to remember this',
                ),
              },
            }),
        }}
        onGroupSubmit={() => void form.handleSubmit()}
      >
        {formGroup => (
          <VStack gap='md' pb='md' pi='md'>
            <P size='sm'>{prompt}</P>
            <form.AppField name='remember.goingForward'>
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
                  onSelect={() => void formGroup.handleSubmit()}
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
        )}
      </form.FormGroup>
    )
  },
})
