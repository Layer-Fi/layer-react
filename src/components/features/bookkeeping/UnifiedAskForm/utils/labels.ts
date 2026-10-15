import type { TFunction } from 'i18next'

import { AskFormChecklistRequirement, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { type ListFormatFn } from '@utils/shared/i18n/list/formatters'
import { tPlural } from '@utils/shared/i18n/plural'
import {
  type AskFormAnswerValues,
  type AskFormInputValues,
  type AskFormRowValues,
  type AskFormStepValues,
  getFollowUpStep,
} from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { type AskFormChecklistStep, type AskFormStepFields, findOption, getCheckedItems, isSheetStep } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

const TEMPLATE = /\{\{\s*answer\.([\w-]+)(\.follow_up)?\.label\s*\}\}/g

type FormatNumber = (value: number) => string

const getPickLabel = (step: AskFormStepFields, { choice, selection, text }: AskFormInputValues) => {
  if (selection) return selection.label
  if (choice) return findOption(step, choice)?.label ?? choice
  return text.trim() || null
}

const getInputLabel = (t: TFunction, step: AskFormStepFields, values: AskFormInputValues, formatList: ListFormatFn) => {
  if (step.type !== AskFormStepType.Checklist) return getPickLabel(step, values)

  const labels = getCheckedItems(step, values.checked).map(({ label }) => label)
  return labels.length > 0 ? formatList(labels) : t('bookkeeping:utils.labels.label.none', 'None')
}

/** A choice follow-up reads as its own pick; a free-text or checklist one reads as the option it explains. */
export const getChoiceLabel = (step: AskFormStepFields, values: AskFormAnswerValues) => {
  const followUpStep = getFollowUpStep(step, values)
  const optionLabel = getPickLabel(step, values)

  if (!followUpStep || followUpStep.type === AskFormStepType.Checklist || values.followUp.text.trim()) return optionLabel
  return getPickLabel(followUpStep, values.followUp) ?? optionLabel
}

const getFollowUpLabel = (t: TFunction, step: AskFormStepFields, values: AskFormAnswerValues, formatList: ListFormatFn) => {
  const followUpStep = getFollowUpStep(step, values)
  return followUpStep ? getInputLabel(t, followUpStep, values.followUp, formatList) : null
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

export type ChecklistReviewLine = { value: string, text: string }

const getChecklistReviewLines = (t: TFunction, step: AskFormChecklistStep, checked: ReadonlyArray<string>): ChecklistReviewLine[] => {
  if (step.require !== AskFormChecklistRequirement.Items) {
    return getCheckedItems(step, checked).map(({ value, label }) => ({ value, text: label }))
  }

  return step.items.map(({ value, label }) => ({
    value,
    text: t('bookkeeping:utils.labels.label.checklist_item', '{{label}}: {{answer}}', {
      label,
      answer: checked.includes(value) ? t('common:label.yes', 'Yes') : t('common:label.no', 'No'),
    }),
  }))
}

export const getReviewLines = (t: TFunction, step: AskFormStepFields, values: AskFormStepValues | undefined): ChecklistReviewLine[] =>
  (step.type === AskFormStepType.Checklist ? getChecklistReviewLines(t, step, values?.checked ?? []) : [])

/** The short label a whole step's answer shows in the review and in prompt templates. */
type StepLabelOptions = {
  t: TFunction
  formatNumber: FormatNumber
  formatList: ListFormatFn
  step: AskFormStepFields
  values: AskFormStepValues | undefined
}

export const getStepLabel = ({ t, formatNumber, formatList, step, values }: StepLabelOptions): string | null => {
  if (!values) return null

  switch (step.type) {
    case AskFormStepType.Action:
      return t('bookkeeping:utils.labels.label.done', 'Done')
    case AskFormStepType.Upload:
      return values.files.length > 0
        ? tPlural(t, 'bookkeeping:utils.labels.label.file_count', {
          count: values.files.length,
          displayCount: formatNumber(values.files.length),
          one: '{{displayCount}} file',
          other: '{{displayCount}} files',
        })
        : null
    case AskFormStepType.Checklist:
      return getInputLabel(t, step, values, formatList)
    default:
      return isSheetStep(step) ? getSheetLabel(t, step, values.rows) : getChoiceLabel(step, values)
  }
}

/** Fills `{{answer.<step>.label}}` and `{{answer.<step>.follow_up.label}}` placeholders with the answers given so far. */
type PromptTemplateOptions = {
  t: TFunction
  formatNumber: FormatNumber
  formatList: ListFormatFn
  text: string | null | undefined
  stepsById: ReadonlyMap<string, AskFormStepFields>
  stepValues: Readonly<Record<string, AskFormStepValues>>
}

export const fillPromptTemplate = ({ t, formatNumber, formatList, text, stepsById, stepValues }: PromptTemplateOptions) => {
  const getLabel = (stepId: string, isFollowUp: boolean) => {
    const step = stepsById.get(stepId)
    const values = stepValues[stepId]

    if (!step || !values) return null
    return isFollowUp ? getFollowUpLabel(t, step, values, formatList) : getStepLabel({ t, formatNumber, formatList, step, values })
  }

  return text?.replace(TEMPLATE, (_match, stepId: string, followUp: string | undefined) =>
    getLabel(stepId, followUp !== undefined) ?? t('bookkeeping:utils.labels.label.unanswered', '…')) ?? null
}
