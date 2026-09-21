import { formOptions } from '@tanstack/react-form'

import { AccountIdentifierEquivalence } from '@schemas/common/accountIdentifier'
import { type CounterpartyAskResponse } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskResponse'
import {
  type CounterpartyAskAccount,
  type CounterpartyAskTask,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import {
  buildAllSameCounterpartyAskResponse,
  buildItemisedCounterpartyAskResponse,
  collapseUniformCounterpartyAskAnswers,
  type CounterpartyAskAnswerValue,
  type CounterpartyAskTransactionAnswerEntry,
} from '@utils/features/bookkeeping/counterpartyAskAnswers'

export const OTHER_ANSWER_KEY = 'other'
export const MIX_ANSWER_KEY = 'mix'

export const toSuggestionAnswerKey = (index: number) => `suggestion-${index}`

export const toSuggestionOptions = (suggestions: readonly CounterpartyAskAccount[]) =>
  suggestions.map((suggestion, index) => ({ value: toSuggestionAnswerKey(index), label: suggestion.name }))

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

/** One group per pane, so each pane validates and submits only its own slice. */
export type CounterpartyAskFormValues = {
  picker: { answerKey: string | null }
  freeText: { text: string }
  itemised: { rows: CounterpartyAskRowValues[] }
  remember: { goingForward: GoingForwardChoice | null }
}

const EMPTY_VALUES: CounterpartyAskFormValues = {
  picker: { answerKey: null },
  freeText: { text: '' },
  itemised: { rows: [] },
  remember: { goingForward: null },
}

// Shared by the form and its `withForm` panes; the real defaults come from the task.
export const counterpartyAskFormOptions = formOptions({ defaultValues: EMPTY_VALUES })

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
  const stored = getStoredCounterpartyAskAnswerSummary(task)
  const hasWholeAnswer = stored !== null && stored.kind !== 'itemised'

  return {
    picker: {
      answerKey: stored?.kind === 'itemised'
        ? MIX_ANSWER_KEY
        : toAnswerKey(task.suggestions, task.responseAccount, task.userResponse),
    },
    freeText: { text: task.userResponse ?? '' },
    itemised: {
      rows: task.transactions.map(({ id }) => {
        const response = task.transactionResponses.find(({ transactionId }) => transactionId === id)

        return {
          transactionId: id,
          answerKey: toAnswerKey(task.suggestions, response?.responseAccount, response?.userResponse),
          text: response?.userResponse ?? '',
        }
      }),
    },
    remember: { goingForward: hasWholeAnswer ? (task.alwaysThis ? 'always' : 'ask') : null },
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
  { picker: { answerKey }, freeText: { text }, itemised: { rows } }: CounterpartyAskFormValues,
): CounterpartyAskAnswerValue | null => {
  if (answerKey !== MIX_ANSWER_KEY) return resolveCounterpartyAskAnswer(suggestions, answerKey, text)

  const answered = getAnsweredRows(suggestions, rows)

  return answered.length === rows.length
    ? collapseUniformCounterpartyAskAnswers(answered.map(({ answer }) => answer))
    : null
}

export type CounterpartyAskSubmission = {
  response: CounterpartyAskResponse
  answer: CounterpartyAskAnswerSummary
  /** Whether the host should hear `onTransactionCategorized`; an earlier account answer counts. */
  wasCategorized: boolean
}

export const buildCounterpartyAskSubmission = (
  task: CounterpartyAskTask,
  values: CounterpartyAskFormValues,
): CounterpartyAskSubmission | null => {
  const { suggestions } = task
  const hadAccountAnswer = Boolean(task.responseAccount)
    || task.transactionResponses.some(({ responseAccount }) => Boolean(responseAccount))

  const { goingForward } = values.remember

  if (values.picker.answerKey === MIX_ANSWER_KEY && goingForward === null) {
    const rows = getAnsweredRows(suggestions, values.itemised.rows)
    const response = buildItemisedCounterpartyAskResponse(rows)

    return response && {
      response,
      answer: { kind: 'itemised' },
      wasCategorized: hadAccountAnswer || rows.every(({ answer }) => answer.kind === 'account'),
    }
  }

  const wholeAnswer = getWholeAnswer(suggestions, values)

  if (!wholeAnswer) return null

  return {
    response: buildAllSameCounterpartyAskResponse(wholeAnswer, goingForward === 'always'),
    answer: wholeAnswer.kind === 'account' ? { kind: 'account', name: wholeAnswer.account.name } : { kind: 'text' },
    wasCategorized: hadAccountAnswer || wholeAnswer.kind === 'account',
  }
}
