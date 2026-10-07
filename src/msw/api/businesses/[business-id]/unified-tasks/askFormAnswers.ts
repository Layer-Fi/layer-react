import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type AskFormAnswer, type AskFormAnswers } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { type AskFormStep } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'

import { ASK_FORM_STEP_IDS, COUNTERPARTY_ASK_FORM_VALUES } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'

const findChosenLabel = (step: AskFormStep, answer: AskFormAnswer): string | null => {
  if ('choice' in answer) {
    const options = 'options' in step ? step.options : []
    const option = options.find(({ value }) => value === answer.choice)

    if (answer.followUp && 'text' in answer.followUp) return answer.followUp.text
    return option?.label ?? null
  }
  if ('text' in answer) return answer.text
  if ('documentIds' in answer) return `${answer.documentIds.length} ${answer.documentIds.length === 1 ? 'file' : 'files'}`
  if ('transactionAnswers' in answer) return 'Varies by transaction'
  return null
}

export const summarizeAskFormAnswers = (form: AskForm, answers: AskFormAnswers): string | null => {
  const entryStep = form.pages.find(({ id }) => id === form.entryPageId)?.steps[0]
  const entryAnswer = entryStep ? answers[entryStep.id] : undefined

  if (!entryStep || !entryAnswer) return null
  if ('choice' in entryAnswer && entryAnswer.choice === COUNTERPARTY_ASK_FORM_VALUES.mix) return 'Varies by transaction'

  return findChosenLabel(entryStep, entryAnswer)
}

const isCategoryChoice = (answer: AskFormAnswer | undefined) =>
  answer !== undefined && 'choice' in answer && answer.choice.startsWith('acct_')

export const isCategorizedByAskFormAnswers = (answers: AskFormAnswers) => {
  const rows = answers[ASK_FORM_STEP_IDS.rows]

  if (rows && 'transactionAnswers' in rows) {
    return rows.transactionAnswers.every(({ answer }) => isCategoryChoice(answer))
  }

  return isCategoryChoice(answers[ASK_FORM_STEP_IDS.category]) || isCategoryChoice(answers[ASK_FORM_STEP_IDS.vendorCategory])
}
