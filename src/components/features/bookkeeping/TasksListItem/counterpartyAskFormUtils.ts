import { AccountIdentifierEquivalence } from '@schemas/common/accountIdentifier'
import {
  type CounterpartyAskAccount,
  type CounterpartyAskTask,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import {
  collapseUniformCounterpartyAskAnswers,
  type CounterpartyAskAnswerValue,
  type CounterpartyAskTransactionAnswerEntry,
} from '@utils/features/bookkeeping/counterpartyAskAnswers'

export const OTHER_ANSWER_KEY = 'other'
export const MIX_ANSWER_KEY = 'mix'

export const toSuggestionAnswerKey = (index: number) => `suggestion-${index}`

export type GoingForwardChoice = 'always' | 'ask'

export type CounterpartyAskAnswerSummary =
  | { kind: 'account', name: string }
  | { kind: 'text' }
  | { kind: 'itemised' }

export const getStoredCounterpartyAskAnswerSummary = (
  task: CounterpartyAskTask,
): CounterpartyAskAnswerSummary | null => {
  if (task.responseAccount) return { kind: 'account', name: task.responseAccount.name }
  if (task.userResponse) return { kind: 'text' }

  const hasRowAnswers = task.transactionResponses.some(
    ({ responseAccount, userResponse }) => responseAccount || userResponse,
  )

  return hasRowAnswers ? { kind: 'itemised' } : null
}

export type CounterpartyAskRowValues = {
  transactionId: string
  answerKey: string | null
  text: string
}

export type CounterpartyAskFormValues = {
  answerKey: string | null
  freeText: string
  goingForward: GoingForwardChoice | null
  rows: CounterpartyAskRowValues[]
}

const toAnswerKey = (
  suggestions: readonly CounterpartyAskAccount[],
  account: CounterpartyAskAccount | null | undefined,
  text: string | null | undefined,
) => {
  if (account) {
    const index = suggestions.findIndex(suggestion =>
      AccountIdentifierEquivalence(suggestion.accountIdentifier, account.accountIdentifier),
    )

    return index >= 0 ? toSuggestionAnswerKey(index) : null
  }

  return text ? OTHER_ANSWER_KEY : null
}

export const getCounterpartyAskFormDefaultValues = (task: CounterpartyAskTask): CounterpartyAskFormValues => {
  const rows = task.transactions.map(({ id }) => {
    const response = task.transactionResponses.find(({ transactionId }) => transactionId === id)

    return {
      transactionId: id,
      answerKey: toAnswerKey(task.suggestions, response?.responseAccount, response?.userResponse),
      text: response?.userResponse ?? '',
    }
  })

  const hasRowAnswers = rows.some(({ answerKey }) => answerKey !== null)
  const hasWholeAnswer = Boolean(task.responseAccount) || Boolean(task.userResponse)

  return {
    answerKey: toAnswerKey(task.suggestions, task.responseAccount, task.userResponse)
      ?? (hasRowAnswers ? MIX_ANSWER_KEY : null),
    freeText: task.userResponse ?? '',
    goingForward: hasWholeAnswer ? (task.alwaysThis ? 'always' : 'ask') : null,
    rows,
  }
}

export const resolveCounterpartyAskAnswer = (
  suggestions: readonly CounterpartyAskAccount[],
  answerKey: string | null,
  text: string,
): CounterpartyAskAnswerValue | null => {
  if (!answerKey) return null

  if (answerKey === OTHER_ANSWER_KEY) {
    const trimmed = text.trim()
    return trimmed ? { kind: 'text', text: trimmed } : null
  }

  const suggestion = suggestions.find((_, index) => toSuggestionAnswerKey(index) === answerKey)

  return suggestion ? { kind: 'account', account: suggestion } : null
}

export const getAnsweredRows = (
  suggestions: readonly CounterpartyAskAccount[],
  rows: readonly CounterpartyAskRowValues[],
): CounterpartyAskTransactionAnswerEntry[] =>
  rows.flatMap(({ transactionId, answerKey, text }) => {
    const answer = resolveCounterpartyAskAnswer(suggestions, answerKey, text)

    return answer ? [{ transactionId, answer }] : []
  })

/** The single answer a submission would carry; itemised rows only count once they all agree. */
export const getWholeAnswer = (
  suggestions: readonly CounterpartyAskAccount[],
  { answerKey, freeText, rows }: CounterpartyAskFormValues,
): CounterpartyAskAnswerValue | null => {
  if (answerKey !== MIX_ANSWER_KEY) return resolveCounterpartyAskAnswer(suggestions, answerKey, freeText)

  const answered = getAnsweredRows(suggestions, rows)

  return answered.length === rows.length
    ? collapseUniformCounterpartyAskAnswers(answered.map(({ answer }) => answer))
    : null
}
