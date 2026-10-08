import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import {
  type AskFormAnswer,
  type AskFormAnswers,
  type AskFormFollowUpAnswer,
  isChoiceAnswer,
  isCompletedAnswer,
  isDocumentsAnswer,
  isTextAnswer,
  isTransactionAnswers,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { getPickedValue } from '@utils/shared/form/pickedValue'
import { type AskFormStepFields, findFollowUp, findOption, isSheetStep } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

export type AskFormSelection = { value: string, label: string, isCreated?: boolean }

export type AskFormFile = { id: string, name: string }

export type AskFormInputValues = {
  choice: string | null
  selection: AskFormSelection | null
  text: string
}

export type AskFormAnswerValues = AskFormInputValues & { followUp: AskFormInputValues }

export type AskFormRowValues = AskFormAnswerValues & { transactionId: string }

export type AskFormStepValues = AskFormAnswerValues & {
  files: AskFormFile[]
  completed: boolean
  rows: AskFormRowValues[]
}

export type AskFormPageValues = Record<string, AskFormStepValues>

/** Grouped by page so each page validates and continues through its own `FormGroup`. */
export type UnifiedAskFormValues = { pages: Record<string, AskFormPageValues> }

export const getFollowUpStep = (step: AskFormStepFields, values: AskFormInputValues) => findFollowUp(step, getPickedValue(values))

const toInputValues = (step: AskFormStepFields, answer: AskFormFollowUpAnswer | undefined): AskFormInputValues => {
  if (!answer) return { choice: null, selection: null, text: '' }

  if (isTextAnswer(answer)) {
    return step.type === AskFormStepType.SearchWithFreeform
      ? { choice: null, selection: { value: answer.text, label: answer.text, isCreated: true }, text: '' }
      : { choice: null, selection: null, text: answer.text }
  }

  const option = findOption(step, answer.choice)

  return option
    ? { choice: option.value, selection: null, text: '' }
    : { choice: null, selection: { value: answer.choice, label: answer.choice }, text: '' }
}

const toAnswerValues = (step: AskFormStepFields, answer: AskFormAnswer | undefined): AskFormAnswerValues => {
  const choiceAnswer = isChoiceAnswer(answer) ? answer : undefined
  const followUpStep = choiceAnswer ? findFollowUp(step, choiceAnswer.choice) : undefined

  return {
    ...toInputValues(step, choiceAnswer ?? (isTextAnswer(answer) ? answer : undefined)),
    followUp: followUpStep && choiceAnswer
      ? toInputValues(followUpStep, choiceAnswer.followUp)
      : toInputValues(step, undefined),
  }
}

export const toStepValues = (
  step: AskFormStepFields,
  answer: AskFormAnswer | undefined,
  transactionIds: ReadonlyArray<string>,
): AskFormStepValues => {
  const rows = isSheetStep(step)
    ? transactionIds.map((transactionId) => {
      const row = isTransactionAnswers(answer)
        ? answer.transactionAnswers.find(other => other.transactionId === transactionId)
        : undefined

      return { transactionId, ...toAnswerValues(step, row?.answer) }
    })
    : []

  return {
    ...toAnswerValues(step, answer),
    files: isDocumentsAnswer(answer) ? answer.documentIds.map(id => ({ id, name: id })) : [],
    completed: isCompletedAnswer(answer),
    rows,
  }
}

export const toFormValues = (
  pages: ReadonlyArray<AskFormPage>,
  answers: AskFormAnswers,
  transactionIds: ReadonlyArray<string>,
): UnifiedAskFormValues => ({
  pages: Object.fromEntries(pages.map(page => [
    page.id,
    Object.fromEntries(page.steps.map(step => [step.id, toStepValues(step, answers[step.id], transactionIds)])),
  ])),
})

const hasRowsFor = (rows: ReadonlyArray<AskFormRowValues>, transactionIds: ReadonlyArray<string>) =>
  rows.length === transactionIds.length && rows.every((row, index) => row.transactionId === transactionIds[index])

/** Rebuilds each sheet's rows for the current transaction ids, keeping existing rows; `null` when nothing changed. */
export const syncSheetRows = (
  pages: ReadonlyArray<AskFormPage>,
  values: UnifiedAskFormValues,
  answers: AskFormAnswers,
  transactionIds: ReadonlyArray<string>,
): UnifiedAskFormValues | null => {
  const staleSheets = pages.flatMap(page => page.steps.filter(isSheetStep).flatMap((step) => {
    const stepValues = values.pages[page.id]?.[step.id]
    return stepValues && !hasRowsFor(stepValues.rows, transactionIds) ? [{ pageId: page.id, step, stepValues }] : []
  }))

  if (staleSheets.length === 0) return null

  return staleSheets.reduce<UnifiedAskFormValues>((synced, { pageId, step, stepValues }) => {
    const existingRows = new Map(stepValues.rows.map(row => [row.transactionId, row]))
    const rows = toStepValues(step, answers[step.id], transactionIds).rows.map(row => existingRows.get(row.transactionId) ?? row)

    return { pages: { ...synced.pages, [pageId]: { ...synced.pages[pageId], [step.id]: { ...stepValues, rows } } } }
  }, values)
}

export const flattenStepValues = (values: UnifiedAskFormValues): Readonly<Record<string, AskFormStepValues>> =>
  Object.fromEntries(Object.values(values.pages).flatMap(page => Object.entries(page)))
