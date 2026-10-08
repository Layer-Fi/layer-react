import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { type AskFormStepFields, findFollowUp, findOption, isSheetStep } from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormUtils'
import {
  type AskFormAnswerValues,
  type AskFormInputValues,
  type AskFormStepValues,
} from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormValues'

const TEMPLATE = /\{\{\s*answer\.([\w-]+)(\.follow_up)?\.label\s*\}\}/g

const UNANSWERED_PLACEHOLDER = '…'

const getInputLabel = (step: AskFormStepFields, { choice, selection, text }: AskFormInputValues) => {
  if (selection) return selection.label
  if (choice) return findOption(step, choice)?.label ?? choice
  return text.trim() || null
}

const getPickedFollowUp = (step: AskFormStepFields, { choice, selection }: AskFormAnswerValues) =>
  findFollowUp(step, choice ?? (selection && !selection.isCreated ? selection.value : null))

const getChoiceLabel = (step: AskFormStepFields, values: AskFormAnswerValues) => {
  const followUpStep = getPickedFollowUp(step, values)
  const followUpLabel = followUpStep && !values.followUp.text.trim() ? getInputLabel(followUpStep, values.followUp) : null

  return followUpLabel ?? getInputLabel(step, values)
}

export const useAskFormAnswerLabel = () => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()

  const getAnswerLabel = useCallback((step: AskFormStepFields, values: AskFormStepValues | AskFormAnswerValues | undefined): string | null => {
    if (!values) return null
    if (!('rows' in values)) return getChoiceLabel(step, values)

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

    const rowLabels = new Set(values.rows.map(row => getChoiceLabel(step, row)).filter(label => label !== null))
    const [onlyLabel] = rowLabels

    if (rowLabels.size === 0) return null

    return rowLabels.size === 1 && onlyLabel
      ? onlyLabel
      : t('bookkeeping:UnifiedAskForm.useAskFormAnswerLabel.label.varies_by_transaction', 'Varies by transaction')
  }, [formatNumber, t])

  const fillPromptTemplate = useCallback((
    text: string | null | undefined,
    stepsById: ReadonlyMap<string, AskFormStepFields>,
    stepValues: Readonly<Record<string, AskFormStepValues>>,
  ) => text?.replace(TEMPLATE, (_match, stepId: string, followUp: string | undefined) => {
    const step = stepsById.get(stepId)
    const values = stepValues[stepId]

    if (!step || !values) return UNANSWERED_PLACEHOLDER
    if (!followUp) return getAnswerLabel(step, values) ?? UNANSWERED_PLACEHOLDER

    const followUpStep = getPickedFollowUp(step, values)

    return followUpStep ? getInputLabel(followUpStep, values.followUp) ?? UNANSWERED_PLACEHOLDER : UNANSWERED_PLACEHOLDER
  }) ?? null, [getAnswerLabel])

  return useMemo(() => ({ getAnswerLabel, fillPromptTemplate }), [fillPromptTemplate, getAnswerLabel])
}
