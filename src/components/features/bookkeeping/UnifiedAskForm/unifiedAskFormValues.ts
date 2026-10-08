import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import {
  type AskFormAnswer,
  type AskFormAnswers,
  type AskFormFollowUpAnswer,
  type AskFormRowAnswer,
  isChoiceAnswer,
  isDocumentsAnswer,
  isTextAnswer,
  isTransactionAnswers,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { type AskFormNext, AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import {
  type AskFormStepFields,
  findOption,
  isSheetStep,
} from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormUtils'

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
  const followUpStep = choiceAnswer ? findOption(step, choiceAnswer.choice)?.followUp : undefined

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
    completed: Boolean(answer && 'completed' in answer),
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

// The API rejects blank text, so an untouched text input is no answer at all.
const toInputAnswer = ({ choice, selection, text }: AskFormInputValues): AskFormFollowUpAnswer | null => {
  if (selection) return selection.isCreated ? { text: selection.label } : { choice: selection.value }
  if (choice) return { choice }
  return text.trim() ? { text } : null
}

const toRowAnswer = (step: AskFormStepFields, values: AskFormAnswerValues): AskFormRowAnswer | null => {
  const answer = toInputAnswer(values)

  if (!isChoiceAnswer(answer)) return answer

  const followUpStep = findOption(step, answer.choice)?.followUp
  const followUp = followUpStep ? toInputAnswer(values.followUp) : null

  return followUp ? { ...answer, followUp } : answer
}

export const toStepAnswer = (
  step: AskFormStepFields,
  values: AskFormStepValues,
  transactionIds: ReadonlyArray<string>,
): AskFormAnswer | null => {
  if (step.type === AskFormStepType.Action) return values.completed ? { completed: true } : null
  if (step.type === AskFormStepType.Upload) {
    return values.files.length > 0 ? { documentIds: values.files.map(({ id }) => id) } : null
  }

  if (isSheetStep(step)) {
    const transactionAnswers = values.rows.flatMap(({ transactionId, ...row }) => {
      const answer = transactionIds.includes(transactionId) ? toRowAnswer(step, row) : null
      return answer ? [{ transactionId, answer }] : []
    })

    return transactionAnswers.length > 0 ? { transactionAnswers } : null
  }

  return toRowAnswer(step, values)
}

export const toAnswers = (
  pages: ReadonlyArray<AskFormPage>,
  values: UnifiedAskFormValues,
  transactionIds: ReadonlyArray<string>,
): AskFormAnswers => Object.fromEntries(pages.flatMap(page => page.steps.flatMap((step) => {
  const stepValues = values.pages[page.id]?.[step.id]
  const answer = stepValues ? toStepAnswer(step, stepValues, transactionIds) : null

  return answer ? [[step.id, answer]] : []
})))

const isInputComplete = (step: AskFormStepFields, values: AskFormInputValues) => {
  if (step.type === AskFormStepType.Action) return true
  if (step.type === AskFormStepType.Text && !step.required) return true

  return toInputAnswer(values) !== null
}

const isAnswerComplete = (step: AskFormStepFields, values: AskFormAnswerValues) => {
  if (!isInputComplete(step, values)) return false

  const answer = toInputAnswer(values)
  const followUpStep = isChoiceAnswer(answer) ? findOption(step, answer.choice)?.followUp : undefined

  return !followUpStep || isInputComplete(followUpStep, values.followUp)
}

export const isRowComplete = (step: AskFormStepFields, row: AskFormAnswerValues) => isAnswerComplete(step, row)

export const isStepComplete = (step: AskFormStepFields, values: AskFormStepValues, transactionIds: ReadonlyArray<string>) => {
  if (step.type === AskFormStepType.Action) return true
  if (step.type === AskFormStepType.Upload) return values.files.length > 0
  if (isSheetStep(step)) {
    return transactionIds.every((transactionId) => {
      const row = values.rows.find(other => other.transactionId === transactionId)
      return row !== undefined && isRowComplete(step, row)
    })
  }

  return isAnswerComplete(step, values)
}

export const isPageComplete = (page: AskFormPage, values: UnifiedAskFormValues, transactionIds: ReadonlyArray<string>) =>
  page.steps.every((step) => {
    const stepValues = values.pages[page.id]?.[step.id]
    return stepValues !== undefined && isStepComplete(step, stepValues, transactionIds)
  })

/** An option's `next` beats the page's on a static page; at most one step per page routes. */
export const getPageNext = (page: AskFormPage, values: UnifiedAskFormValues): AskFormNext => {
  if (page.next.kind === AskFormNextKind.Server) return page.next

  const optionNext = page.steps
    .map(step => findOption(step, values.pages[page.id]?.[step.id]?.choice ?? null)?.next)
    .find(next => next)

  return optionNext ?? page.next
}

export const flattenStepValues = (values: UnifiedAskFormValues): Readonly<Record<string, AskFormStepValues>> =>
  Object.fromEntries(Object.values(values.pages).flatMap(page => Object.entries(page)))
