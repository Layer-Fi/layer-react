import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import {
  isChoiceAnswer,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { toInputAnswer } from '@features/bookkeeping/UnifiedAskForm/utils/answers'
import { type AskFormAnswerValues, type AskFormInputValues, type AskFormStepValues, type UnifiedAskFormValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { type AskFormStepFields, findFollowUp, isSheetStep } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

const isInputComplete = (step: AskFormStepFields, values: AskFormInputValues) => {
  if (step.type === AskFormStepType.Action) return true
  if (step.type === AskFormStepType.Text && !step.required) return true

  return toInputAnswer(values) !== null
}

const isAnswerComplete = (step: AskFormStepFields, values: AskFormAnswerValues) => {
  if (!isInputComplete(step, values)) return false

  const answer = toInputAnswer(values)
  const followUpStep = isChoiceAnswer(answer) ? findFollowUp(step, answer.choice) : undefined

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
