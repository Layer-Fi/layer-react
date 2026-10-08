import type { TFunction } from 'i18next'

import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { tPlural } from '@utils/shared/i18n/plural'
import {
  type AskFormAnswerValues,
  type AskFormInputValues,
  type AskFormRowValues,
  type AskFormStepValues,
  getFollowUpStep,
} from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { type AskFormStepFields, findOption, isSheetStep } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

const TEMPLATE = /\{\{\s*answer\.([\w-]+)(\.follow_up)?\.label\s*\}\}/g

type FormatNumber = (value: number) => string

export const getInputLabel = (step: AskFormStepFields, { choice, selection, text }: AskFormInputValues) => {
  if (selection) return selection.label
  if (choice) return findOption(step, choice)?.label ?? choice
  return text.trim() || null
}

/** A choice follow-up reads as its own pick; a free-text one reads as the option it explains. */
export const getChoiceLabel = (step: AskFormStepFields, values: AskFormAnswerValues) => {
  const followUpStep = getFollowUpStep(step, values)
  const followUpPick = followUpStep && !values.followUp.text.trim() ? getInputLabel(followUpStep, values.followUp) : null

  return followUpPick ?? getInputLabel(step, values)
}

export const getFollowUpLabel = (step: AskFormStepFields, values: AskFormAnswerValues) => {
  const followUpStep = getFollowUpStep(step, values)
  return followUpStep ? getInputLabel(followUpStep, values.followUp) : null
}

const getSheetLabel = (t: TFunction, step: AskFormStepFields, rows: ReadonlyArray<AskFormRowValues>) => {
  const rowLabels = new Set(rows.flatMap((row) => {
    const label = getChoiceLabel(step, row)
    return label === null ? [] : [label]
  }))

  if (rowLabels.size > 1) return t('bookkeeping:utils.labels.label.varies_by_transaction', 'Varies by transaction')

  const [onlyLabel] = rowLabels
  return onlyLabel ?? null
}

/** The short label a whole step's answer shows in the review and in prompt templates. */
type StepLabelOptions = {
  t: TFunction
  formatNumber: FormatNumber
  step: AskFormStepFields
  values: AskFormStepValues | undefined
}

export const getStepLabel = ({ t, formatNumber, step, values }: StepLabelOptions): string | null => {
  if (!values) return null

  switch (step.type) {
    case AskFormStepType.Action:
      return values.completed ? t('bookkeeping:utils.labels.label.done', 'Done') : null
    case AskFormStepType.Upload:
      return values.files.length > 0
        ? tPlural(t, 'bookkeeping:utils.labels.label.file_count', {
          count: values.files.length,
          displayCount: formatNumber(values.files.length),
          one: '{{displayCount}} file',
          other: '{{displayCount}} files',
        })
        : null
    default:
      return isSheetStep(step) ? getSheetLabel(t, step, values.rows) : getChoiceLabel(step, values)
  }
}

/** Fills `{{answer.<step>.label}}` and `{{answer.<step>.follow_up.label}}` placeholders with the answers given so far. */
type PromptTemplateOptions = {
  t: TFunction
  formatNumber: FormatNumber
  text: string | null | undefined
  stepsById: ReadonlyMap<string, AskFormStepFields>
  stepValues: Readonly<Record<string, AskFormStepValues>>
}

export const fillPromptTemplate = ({ t, formatNumber, text, stepsById, stepValues }: PromptTemplateOptions) => {
  const getLabel = (stepId: string, isFollowUp: boolean) => {
    const step = stepsById.get(stepId)
    const values = stepValues[stepId]

    if (!step || !values) return null
    return isFollowUp ? getFollowUpLabel(step, values) : getStepLabel({ t, formatNumber, step, values })
  }

  return text?.replace(TEMPLATE, (_match, stepId: string, followUp: string | undefined) =>
    getLabel(stepId, followUp !== undefined) ?? t('bookkeeping:utils.labels.label.unanswered', '…')) ?? null
}
