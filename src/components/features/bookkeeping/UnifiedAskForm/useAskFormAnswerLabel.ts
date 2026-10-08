import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { type AskFormStepValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { fillPromptTemplate, getChoiceLabel, getFollowUpLabel } from '@features/bookkeeping/UnifiedAskForm/utils/labels'
import { type AskFormStepFields, isSheetStep } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

export const useAskFormAnswerLabel = () => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()

  const getAnswerLabel = useCallback((step: AskFormStepFields, values: AskFormStepValues | undefined): string | null => {
    if (!values) return null

    if (step.type === AskFormStepType.Action) {
      return values.completed ? t('bookkeeping:UnifiedAskForm.useAskFormAnswerLabel.label.done', 'Done') : null
    }

    if (step.type === AskFormStepType.Upload) {
      return values.files.length > 0
        ? tPlural(t, 'bookkeeping:UnifiedAskForm.useAskFormAnswerLabel.label.file_count', {
          count: values.files.length,
          displayCount: formatNumber(values.files.length),
          one: '{{displayCount}} file',
          other: '{{displayCount}} files',
        })
        : null
    }

    if (!isSheetStep(step)) return getChoiceLabel(step, values)

    const rowLabels = new Set(values.rows.flatMap((row) => {
      const label = getChoiceLabel(step, row)
      return label === null ? [] : [label]
    }))
    const [onlyLabel] = rowLabels

    return rowLabels.size > 1
      ? t('bookkeeping:UnifiedAskForm.useAskFormAnswerLabel.label.varies_by_transaction', 'Varies by transaction')
      : onlyLabel ?? null
  }, [formatNumber, t])

  const fillStepPrompt = useCallback((
    text: string | null | undefined,
    stepsById: ReadonlyMap<string, AskFormStepFields>,
    stepValues: Readonly<Record<string, AskFormStepValues>>,
  ) => fillPromptTemplate(text, (stepId, isFollowUp) => {
    const step = stepsById.get(stepId)
    const values = stepValues[stepId]

    if (!step || !values) return null
    return isFollowUp ? getFollowUpLabel(step, values) : getAnswerLabel(step, values)
  }, t('bookkeeping:UnifiedAskForm.useAskFormAnswerLabel.label.unanswered', '…')), [getAnswerLabel, t])

  return useMemo(() => ({ getAnswerLabel, fillPromptTemplate: fillStepPrompt }), [fillStepPrompt, getAnswerLabel])
}
