import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { type CounterpartyAskForm } from '@features/bookkeeping/TasksListItem/useCounterpartyAskForm'

type CounterpartyAskFreeTextPaneProps = {
  form: CounterpartyAskForm
  onContinue: () => void
}

export const CounterpartyAskFreeTextPane = ({ form, onContinue }: CounterpartyAskFreeTextPaneProps) => {
  const { t } = useTranslation()
  const freeText = useStore(form.store, state => state.values.freeText)

  const prompt = t(
    'bookkeeping:TasksListItem.CounterpartyAskFreeTextPane.prompt.what_were_these_for',
    'What were these purchases for?',
  )

  return (
    <VStack gap='md' pb='md' pi='md'>
      <P size='sm'>{prompt}</P>
      <VStack className='Layer__CounterpartyAskTask__FreeText'>
        <form.AppField name='freeText'>
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
        <Button isDisabled={!freeText.trim()} onPress={onContinue}>
          {t('common:action.save_label', 'Save')}
        </Button>
      </HStack>
    </VStack>
  )
}
