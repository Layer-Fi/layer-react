import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { toAnswers, toInputAnswer } from '@features/bookkeeping/UnifiedAskForm/utils/answers'
import {
  type AskFormAnswerValues,
  type AskFormInputValues,
  type AskFormStepValues,
  getFollowUpStep,
  type UnifiedAskFormValues,
} from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { getPageNext } from '@features/bookkeeping/UnifiedAskForm/utils/routing'
import { type AskFormStepFields, isChecklistSatisfied, isSheetStep } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

const isInputComplete = (step: AskFormStepFields, values: AskFormInputValues) => {
  switch (step.type) {
    case AskFormStepType.Checklist:
      return isChecklistSatisfied(step, values.checked)
    case AskFormStepType.Text:
      return !step.required || toInputAnswer(step, values) !== null
    case AskFormStepType.Choice:
    case AskFormStepType.Category:
    case AskFormStepType.Search:
    case AskFormStepType.SearchWithFreeform:
    case AskFormStepType.Action:
    case AskFormStepType.Upload:
      return toInputAnswer(step, values) !== null
  }
}

export const isRowComplete = (step: AskFormStepFields, values: AskFormAnswerValues) => {
  const followUpStep = getFollowUpStep(step, values)

  return isInputComplete(step, values) && (!followUpStep || isInputComplete(followUpStep, values.followUp))
}

export const isStepComplete = (step: AskFormStepFields, values: AskFormStepValues, transactionIds: ReadonlyArray<string>) => {
  if (step.type === AskFormStepType.Action) return true
  if (step.type === AskFormStepType.Upload) return values.files.length > 0
  if (!isSheetStep(step)) return isRowComplete(step, values)

  const rowsById = new Map(values.rows.map(row => [row.transactionId, row]))

  return transactionIds.every((transactionId) => {
    const row = rowsById.get(transactionId)
    return row !== undefined && isRowComplete(step, row)
  })
}

export const isPageComplete = (page: AskFormPage, values: UnifiedAskFormValues, transactionIds: ReadonlyArray<string>) =>
  page.steps.every((step) => {
    const stepValues = values.pages[page.id]?.[step.id]
    return stepValues !== undefined && isStepComplete(step, stepValues, transactionIds)
  })

export const findFirstIncompletePage = (
  pages: ReadonlyArray<AskFormPage>,
  values: UnifiedAskFormValues,
  transactionIds: ReadonlyArray<string>,
) => pages.find(page => !isPageComplete(page, values, transactionIds))

export type AskFormPageProblem = 'incomplete' | 'nothing_to_post'

/** Why the customer can't continue from a page: a step is unanswered, or it would leave the form with nothing to post. */
export const getPageProblem = (
  page: AskFormPage,
  values: UnifiedAskFormValues,
  visitedPages: ReadonlyArray<AskFormPage>,
  transactionIds: ReadonlyArray<string>,
): AskFormPageProblem | null => {
  if (!isPageComplete(page, values, transactionIds)) return 'incomplete'

  const leavesPages = getPageNext(page, values).kind !== AskFormNextKind.Page
  const hasAnswers = Object.keys(toAnswers([...visitedPages, page], values, transactionIds)).length > 0

  return leavesPages && !hasAnswers ? 'nothing_to_post' : null
}
