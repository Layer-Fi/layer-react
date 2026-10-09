import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { VStack } from '@ui/Stack/Stack'
import { UnifiedAskFormStep } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormStep'
import { UnifiedAskFormTransactionSheet } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormTransactionSheet'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { type UnifiedAskFormNavigation } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormNavigation'
import { flattenStepValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { fillPromptTemplate } from '@features/bookkeeping/UnifiedAskForm/utils/labels'
import { type UnifiedAskFormPresentation } from '@features/bookkeeping/UnifiedAskForm/utils/routing'
import { findFollowUp, isSheetStep } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

type UnifiedAskFormPageStepsProps = {
  task: UnifiedAskFormTask
  page: AskFormPage
  form: UnifiedAskFormApi
  stepsById: UnifiedAskFormNavigation['stepsById']
  presentation: UnifiedAskFormPresentation
  isDisabled: boolean
  /** Set when a pick should continue straight away, unless the picked option has a follow-up. */
  onAutoAdvance?: () => void
}

export const UnifiedAskFormPageSteps = ({ task, page, form, stepsById, presentation, isDisabled, onAutoAdvance }: UnifiedAskFormPageStepsProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const stepValues = useStore(form.store, ({ values }) => flattenStepValues(values))

  return page.steps.map((step) => {
    const prompt = fillPromptTemplate({ t, formatNumber, text: step.prompt, stepsById, stepValues })

    if (isSheetStep(step)) {
      return (
        <UnifiedAskFormTransactionSheet
          key={step.id}
          form={form}
          pageId={page.id}
          taskId={task.id}
          step={step}
          prompt={prompt}
          transactions={task.transactions}
        />
      )
    }

    return (
      <VStack key={step.id} pi='md'>
        <UnifiedAskFormStep
          form={form}
          fields={`pages.${page.id}.${step.id}`}
          taskId={task.id}
          step={step}
          prompt={prompt}
          presentation={presentation}
          isDisabled={isDisabled}
          onSelect={onAutoAdvance
            ? (value) => {
              if (!findFollowUp(step, value)) onAutoAdvance()
            }
            : undefined}
        />
      </VStack>
    )
  })
}
