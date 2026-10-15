import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import {
  type AskFormAnswer,
  type AskFormAnswers,
  type AskFormFollowUpAnswer,
  type AskFormRowAnswer,
  isChoiceAnswer,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import {
  type AskFormAnswerValues,
  type AskFormInputValues,
  type AskFormStepValues,
  getFollowUpStep,
  type UnifiedAskFormValues,
} from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { type AskFormStepFields, isSheetStep } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

// The API rejects blank text, so an untouched text input is no answer at all.
const toPickAnswer = ({ choice, selection, text }: AskFormInputValues) => {
  if (selection?.isCreated) return selection.label.trim() ? { text: selection.label } : null
  if (selection) return { choice: selection.value }
  if (choice) return { choice }
  return text.trim() ? { text } : null
}

// Nothing checked is still an answer: it satisfies a checklist whose items are all optional.
const toCheckedAnswer = ({ checked }: AskFormInputValues) => ({ checked })

export const toInputAnswer = (step: AskFormStepFields, values: AskFormInputValues): AskFormFollowUpAnswer | null =>
  (step.type === AskFormStepType.Checklist ? toCheckedAnswer(values) : toPickAnswer(values))

const toRowAnswer = (step: AskFormStepFields, values: AskFormAnswerValues): AskFormRowAnswer | null => {
  const answer = toPickAnswer(values)
  const followUpStep = getFollowUpStep(step, values)
  const followUp = followUpStep ? toInputAnswer(followUpStep, values.followUp) : null

  return isChoiceAnswer(answer) && followUp ? { ...answer, followUp } : answer
}

export const toStepAnswer = (
  step: AskFormStepFields,
  values: AskFormStepValues,
  transactionIds: ReadonlyArray<string>,
): AskFormAnswer | null => {
  // The primary button is the only way off an ACTION page, so an action on the path has been done.
  if (step.type === AskFormStepType.Action) return { completed: true }
  if (step.type === AskFormStepType.Upload) {
    return values.files.length > 0 ? { documentIds: values.files.map(({ id }) => id) } : null
  }
  if (step.type === AskFormStepType.Checklist) return toCheckedAnswer(values)

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
