import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { withForm } from '@blocks/Form/useForm'
import {
  type CounterpartyAskCounterparty,
  counterpartyAskFormOptions,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'

export const CounterpartyAskFreeTextPane = withForm({
  ...counterpartyAskFormOptions,
  props: {
    kind: 'purchase' as CounterpartyAskCounterparty['kind'],
    onContinue: () => {},
  },
  render: function Render({ form, kind, onContinue }) {
    const { t } = useTranslation()
    const text = useStore(form.store, state => state.values.freeText.text)

    const prompt = kind === 'p2p'
      ? t('bookkeeping:TasksListItem.CounterpartyAskFreeTextPane.prompt.what_were_these_payments_for', 'What were these payments for?')
      : t('bookkeeping:TasksListItem.CounterpartyAskFreeTextPane.prompt.what_were_these_for', 'What were these purchases for?')

    return (
      <form.FormGroup
        name='freeText'
        validators={{
          onDynamic: ({ value }) => (value.text.trim()
            ? undefined
            : {
              fields: {
                text: t('bookkeeping:TasksListItem.CounterpartyAskFreeTextPane.validation.text_required', 'Tell us what these were for'),
              },
            }),
        }}
        onGroupSubmit={onContinue}
      >
        {formGroup => (
          <VStack gap='md' pb='md' pi='md'>
            <P size='sm'>{prompt}</P>
            <VStack className='Layer__CounterpartyAskTask__FreeText'>
              <form.AppField name='freeText.text'>
                {field => (
                  <field.FormTextAreaField
                    label={prompt}
                    showLabel={false}
                    placeholder={t(
                      'bookkeeping:TasksListItem.CounterpartyAskFreeTextPane.placeholder.own_words',
                      'Tell us in your own words',
                    )}
                  />
                )}
              </form.AppField>
            </VStack>
            <HStack justify='end'>
              <Button isDisabled={!text.trim()} onPress={() => void formGroup.handleSubmit()}>
                {t('common:action.save_label', 'Save')}
              </Button>
            </HStack>
          </VStack>
        )}
      </form.FormGroup>
    )
  },
})
