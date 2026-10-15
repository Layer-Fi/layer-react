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
import { type ChecklistReviewLine, fillPromptTemplate, getReviewLines, getStepLabel } from '@features/bookkeeping/UnifiedAskForm/utils/labels'

const UnifiedAskFormReviewList = ({ lines }: { lines: ReadonlyArray<ChecklistReviewLine> }) => (
  <VStack role='list' gap='3xs'>
    {lines.map(({ value, text }) => (
      <HStack key={value} role='listitem' align='baseline' className='Layer__UnifiedAskFormReview__ChecklistItem'>
        <Span size='sm'>{text}</Span>
      </HStack>
    ))}
  </VStack>
)

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
      const values = stepValues[step.id]
      const label = getStepLabel({ t, formatNumber, formatList, step, values })

      return label === null ? [] : [{ step, label, lines: getReviewLines(t, step, values) }]
    })

  return (
    <VStack gap='md' pb='md' pi='md'>
      <P size='sm'>{t('bookkeeping:UnifiedAskForm.UnifiedAskFormReview.label.what_you_told_us', 'Here’s what you told us:')}</P>
      {answeredSteps.map(({ step, label, lines }) => (
        <VStack key={step.id} gap='3xs'>
          <Span size='xs' variant='subtle'>{fillPromptTemplate({ t, formatNumber, formatList, text: step.prompt, stepsById, stepValues }) ?? ''}</Span>
          {lines.length > 0 ? <UnifiedAskFormReviewList lines={lines} /> : <Span size='sm'>{label}</Span>}
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
