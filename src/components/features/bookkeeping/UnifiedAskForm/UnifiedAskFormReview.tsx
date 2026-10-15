import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { type UnifiedAskFormNavigation } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormNavigation'
import { flattenStepValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { fillPromptTemplate, getStepLabel } from '@features/bookkeeping/UnifiedAskForm/utils/labels'

type UnifiedAskFormReviewProps = {
  form: UnifiedAskFormApi
  navigation: UnifiedAskFormNavigation
}

export const UnifiedAskFormReview = ({ form, navigation }: UnifiedAskFormReviewProps) => {
  const { t } = useTranslation()
  const { formatNumber, formatList } = useIntlFormatter()
  const { stepsById, visitedPages, submitReviewed, isReadOnly } = navigation
  const isSubmitting = useStore(form.store, state => state.isSubmitting)
  const stepValues = useStore(form.store, ({ values }) => flattenStepValues(values))

  const answeredSteps = visitedPages
    .flatMap(({ steps }) => steps)
    .filter(step => step.type !== AskFormStepType.Action)
    .flatMap((step) => {
      const label = getStepLabel({ t, formatNumber, formatList, step, values: stepValues[step.id] })
      return label === null ? [] : [{ step, label }]
    })

  return (
    <VStack gap='md' pb='md' pi='md'>
      <P size='sm'>{t('bookkeeping:UnifiedAskForm.UnifiedAskFormReview.label.what_you_told_us', 'Here’s what you told us:')}</P>
      {answeredSteps.map(({ step, label }) => (
        <VStack key={step.id} gap='3xs'>
          <Span size='xs' variant='subtle'>{fillPromptTemplate({ t, formatNumber, formatList, text: step.prompt, stepsById, stepValues }) ?? ''}</Span>
          {step.type === AskFormStepType.Checklist
            ? step.items.map(item => (
              <HStack key={item.value} justify='space-between' gap='md'>
                <Span size='sm'>{item.label}</Span>
                <Span size='sm'>
                  {stepValues[step.id]?.checked.includes(item.value) ? t('common:label.yes', 'Yes') : t('common:label.no', 'No')}
                </Span>
              </HStack>
            ))
            : <Span size='sm'>{label}</Span>}
        </VStack>
      ))}
      {!isReadOnly && (
        <HStack justify='end'>
          <Button isPending={isSubmitting} isDisabled={isSubmitting} onPress={submitReviewed}>
            {t('bookkeeping:UnifiedAskForm.UnifiedAskFormReview.action.submit', 'Submit')}
          </Button>
        </HStack>
      )}
    </VStack>
  )
}
