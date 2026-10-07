import { AccountIdentifierEquivalence } from '@schemas/common/accountIdentifier'
import {
  type BusinessTask,
  isCounterpartyAskTask,
  isLegacyBusinessTask,
  isUnifiedAskFormTask,
} from '@schemas/features/bookkeeping/businessTask'
import { TaskUserResponseType } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import {
  type CounterpartyAskAccount,
  type CounterpartyAskTask,
  type CounterpartyAskTransactionResponse,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { type LegacyBusinessTask } from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'
import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import {
  type AskFormAnswer,
  type AskFormAnswers,
  type AskFormRowAnswer,
  type AskFormTransactionAnswer,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { type AskFormStep } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import {
  AskFormResolutionKind,
  UNIFIED_ASK_FORM_TASK_TYPE,
  type UnifiedAskFormTask,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

import {
  ASK_FORM_STEP_IDS,
  COUNTERPARTY_ASK_FORM_VALUES,
  findCategoryOptionValue,
  makeCounterpartyAskFormFor,
  makeFreeResponseAskForm,
  makeUploadDocumentAskForm,
  toAskFormTransaction,
} from '@fixtures/bookkeeping/unifiedAskFormTasks'
import { createMockStore } from '@msw/utils/createMockStore'

type StoredAnswers = { id: string, answers: AskFormAnswers }

export const unifiedAskFormAnswerStore = createMockStore<StoredAnswers>(() => [])

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

const toCategoryChoice = (account: CounterpartyAskAccount | null | undefined) =>
  (account ? findCategoryOptionValue(account.accountIdentifier) : null)

const toNotSureAnswer = (text: string) => ({ choice: COUNTERPARTY_ASK_FORM_VALUES.notSure, followUp: { text } })

const toRowAnswer = ({ responseAccount, userResponse }: CounterpartyAskTransactionResponse): AskFormRowAnswer | null => {
  const choice = toCategoryChoice(responseAccount)

  if (choice) return { choice }
  return userResponse ? toNotSureAnswer(userResponse) : null
}

const deriveCounterpartyAnswers = (task: CounterpartyAskTask): AskFormAnswers | null => {
  const choice = toCategoryChoice(task.responseAccount)

  if (choice) {
    return {
      [ASK_FORM_STEP_IDS.category]: { choice },
      ...(task.resolvedByTaskId
        ? {}
        : { [ASK_FORM_STEP_IDS.alwaysThis]: { choice: task.alwaysThis ? COUNTERPARTY_ASK_FORM_VALUES.always : COUNTERPARTY_ASK_FORM_VALUES.ask } }),
    }
  }

  if (task.userResponse) return { [ASK_FORM_STEP_IDS.category]: toNotSureAnswer(task.userResponse) }

  const transactionAnswers = task.transactionResponses.flatMap((response): AskFormTransactionAnswer[] => {
    const answer = toRowAnswer(response)
    return answer ? [{ transactionId: response.transactionId, answer }] : []
  })

  return transactionAnswers.length > 0
    ? { [ASK_FORM_STEP_IDS.category]: { choice: COUNTERPARTY_ASK_FORM_VALUES.mix }, [ASK_FORM_STEP_IDS.rows]: { transactionAnswers } }
    : null
}

const withAnsweredAccountSuggested = (task: CounterpartyAskTask): CounterpartyAskTask => {
  const answered = task.responseAccount

  if (!answered || !findCategoryOptionValue(answered.accountIdentifier)) return task
  if (task.suggestions.some(({ accountIdentifier }) => AccountIdentifierEquivalence(accountIdentifier, answered.accountIdentifier))) return task

  return { ...task, suggestions: [...task.suggestions, answered] }
}

const deriveLegacyAnswers = (task: LegacyBusinessTask): AskFormAnswers | null => {
  if (task.userResponseType === TaskUserResponseType.FreeResponse) {
    return task.userResponse ? { [ASK_FORM_STEP_IDS.response]: { text: task.userResponse } } : null
  }

  const documentIds = (task.documents ?? []).flatMap(({ presignedUrl }) => (presignedUrl.documentId ? [presignedUrl.documentId] : []))

  return documentIds.length > 0 ? { [ASK_FORM_STEP_IDS.response]: { documentIds } } : null
}

const toUnified = (
  task: CounterpartyAskTask | LegacyBusinessTask,
  form: AskForm,
  derivedAnswers: AskFormAnswers | null,
): UnifiedAskFormTask => {
  const answers = unifiedAskFormAnswerStore.findById(task.id)?.answers ?? derivedAnswers
  const resolvedByTaskId = isCounterpartyAskTask(task) ? task.resolvedByTaskId : null

  return {
    id: task.id,
    status: task.status,
    taskType: UNIFIED_ASK_FORM_TASK_TYPE,
    title: task.title,
    question: task.question,
    transactions: isCounterpartyAskTask(task) ? task.transactions.map(toAskFormTransaction) : [],
    form,
    answers,
    answerSummary: answers ? summarizeAskFormAnswers(form, answers) : null,
    resolution: resolvedByTaskId ? { kind: AskFormResolutionKind.ResolvedByTask, taskId: resolvedByTaskId } : null,
  }
}

/** Mirrors the API's serializer at `form_version` 1: every ask and human task goes out as a unified task. */
export const toUnifiedAskFormTask = (task: BusinessTask): BusinessTask => {
  if (isUnifiedAskFormTask(task)) return task

  if (isCounterpartyAskTask(task)) {
    return toUnified(task, makeCounterpartyAskFormFor(withAnsweredAccountSuggested(task)), deriveCounterpartyAnswers(task))
  }

  if (isLegacyBusinessTask(task)) {
    if (task.userResponseType === TaskUserResponseType.FreeResponse) {
      return toUnified(task, makeFreeResponseAskForm(task.question), deriveLegacyAnswers(task))
    }
    if (task.userResponseType === TaskUserResponseType.UploadDocument) {
      return toUnified(task, makeUploadDocumentAskForm(task.question), deriveLegacyAnswers(task))
    }
  }

  return task
}
