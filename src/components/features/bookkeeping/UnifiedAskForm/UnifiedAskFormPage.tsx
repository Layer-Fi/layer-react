import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { AskFormAction, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { UnifiedAskFormStep } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormStep'
import { UnifiedAskFormTransactionSheet } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormTransactionSheet'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { type UnifiedAskFormNavigation } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormNavigation'
import { flattenStepValues, type UnifiedAskFormValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { fillPromptTemplate } from '@features/bookkeeping/UnifiedAskForm/utils/labels'
import { getPageNext } from '@features/bookkeeping/UnifiedAskForm/utils/routing'
import { findFollowUp, isSheetStep } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

type UnifiedAskFormPageProps = {
  task: UnifiedAskFormTask
  page: AskFormPage
  form: UnifiedAskFormApi
  navigation: UnifiedAskFormNavigation
}

const withCompletedStep = (values: UnifiedAskFormValues, pageId: string, stepId: string): UnifiedAskFormValues => {
  const pageValues = values.pages[pageId]
  const stepValues = pageValues?.[stepId]

  if (!pageValues || !stepValues) return values

  return { pages: { ...values.pages, [pageId]: { ...pageValues, [stepId]: { ...stepValues, completed: true } } } }
}

export const UnifiedAskFormPage = ({ task, page, form, navigation }: UnifiedAskFormPageProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { stepsById, visitedPages, canGoBack, routing, getPageError, continueFrom } = navigation
  const isSubmitting = useStore(form.store, state => state.isSubmitting)
  const values = useStore(form.store, ({ values }) => values)

  const actionStep = page.steps.find(step => step.type === AskFormStepType.Action)
  const valuesOnPrimary = actionStep ? withCompletedStep(values, page.id, actionStep.id) : values
  const isComplete = getPageError(page, valuesOnPrimary) === undefined
  const stepValues = flattenStepValues(values)

  const [onlyStep] = page.steps
  const canAutoAdvance = page.steps.length === 1
    && onlyStep?.type === AskFormStepType.Choice
    && onlyStep.autoAdvance
    && page.next.kind !== AskFormNextKind.Server

  const getPrimaryLabel = () => {
    if (routing === 'error') return t('bookkeeping:UnifiedAskForm.UnifiedAskFormPage.action.try_again', 'Try again')
    if (actionStep?.type === AskFormStepType.Action && actionStep.action === AskFormAction.ConnectAccount) {
      return t('bookkeeping:UnifiedAskForm.UnifiedAskFormPage.action.connect_account', 'Connect account')
    }

    const next = getPageNext(page, values)

    if (next.kind === AskFormNextKind.Submit) {
      return next.review
        ? t('bookkeeping:UnifiedAskForm.UnifiedAskFormPage.action.review', 'Review')
        : t('bookkeeping:UnifiedAskForm.UnifiedAskFormPage.action.submit', 'Submit')
    }

    return t('bookkeeping:UnifiedAskForm.UnifiedAskFormPage.action.next', 'Next')
  }

  return (
    <form.FormGroup
      name={`pages.${page.id}`}
      validators={{ onDynamic: () => getPageError(page, form.state.values) }}
      onGroupSubmit={() => continueFrom(page)}
    >
      {(group) => {
        const onPrimary = () => {
          if (actionStep) form.setFieldValue('pages', pages => withCompletedStep({ pages }, page.id, actionStep.id).pages)
          void group.handleSubmit()
        }

        return (
          <VStack gap='lg' pb='md'>
            {page.steps.map((step) => {
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
                    onSelect={canAutoAdvance
                      ? (value) => {
                        if (!findFollowUp(step, value)) void group.handleSubmit()
                      }
                      : undefined}
                  />
                </VStack>
              )
            })}
            {routing === 'error'
              ? (
                <HStack pi='md'>
                  <Span size='sm' status='error'>
                    {t('bookkeeping:UnifiedAskForm.UnifiedAskFormPage.error.load_next_question', 'We couldn’t load the next question. Try again.')}
                  </Span>
                </HStack>
              )
              : null}
            <HStack justify='space-between' align='center' pi='md'>
              <Span size='xs' variant='subtle'>
                {canGoBack
                  ? t('bookkeeping:UnifiedAskForm.UnifiedAskFormPage.label.page_number', 'Page {{number}}', { number: formatNumber(visitedPages.length + 1) })
                  : ''}
              </Span>
              <Button isDisabled={!isComplete || isSubmitting} isPending={routing === 'loading' || isSubmitting} onPress={onPrimary}>
                {getPrimaryLabel()}
              </Button>
            </HStack>
          </VStack>
        )
      }}
    </form.FormGroup>
  )
}
