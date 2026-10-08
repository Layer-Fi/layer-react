import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import {
  type AskFormAnswer,
  type AskFormAnswers,
  type AskFormRowAnswer,
  isAccountOptionValue,
  isChoiceAnswer,
  isDocumentsAnswer,
  isTextAnswer,
  isTransactionAnswers,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { AskFormCategoryScope, type AskFormStep, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'

import { COUNTERPARTY_ASK_FORM_VALUES } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'

const findChosenLabel = (step: AskFormStep, answer: AskFormAnswer): string | null => {
  if (isChoiceAnswer(answer)) {
    const options = 'options' in step ? step.options : []
    const option = options.find(({ value }) => value === answer.choice)

    if (answer.followUp && isTextAnswer(answer.followUp)) return answer.followUp.text
    return option?.label ?? null
  }
  if (isTextAnswer(answer)) return answer.text
  if (isDocumentsAnswer(answer)) return `${answer.documentIds.length} ${answer.documentIds.length === 1 ? 'file' : 'files'}`
  if (isTransactionAnswers(answer)) return 'Varies by transaction'
  return null
}

export const summarizeAskFormAnswers = (form: AskForm, answers: AskFormAnswers): string | null => {
  const entryStep = form.pages.find(({ id }) => id === form.entryPageId)?.steps[0]
  const entryAnswer = entryStep ? answers[entryStep.id] : undefined

  if (!entryStep || !entryAnswer) return null
  if (isChoiceAnswer(entryAnswer) && entryAnswer.choice === COUNTERPARTY_ASK_FORM_VALUES.mix) return 'Varies by transaction'

  return findChosenLabel(entryStep, entryAnswer)
}

const isAccountChoice = (answer: AskFormAnswer | AskFormRowAnswer) => isChoiceAnswer(answer) && isAccountOptionValue(answer.choice)

export const isCategorizedByAskFormAnswers = (form: AskForm, answers: AskFormAnswers) => {
  const categorySteps = form.pages
    .flatMap(({ steps }) => steps)
    .filter(step => step.type === AskFormStepType.Category)

  return categorySteps.some((step) => {
    const answer = step.id ? answers[step.id] : undefined

    if (!answer) return false
    if (step.scope === AskFormCategoryScope.EachTransaction) {
      return isTransactionAnswers(answer) && answer.transactionAnswers.every(row => isAccountChoice(row.answer))
    }
    return isAccountChoice(answer)
  })
}
