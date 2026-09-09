import { AccountIdentifierEquivalence } from '@schemas/common/accountIdentifier'
import {
  type CounterpartyAskAnswer,
  type CounterpartyAskResponse,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskResponse'
import { type CounterpartyAskAccount } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'

export type CounterpartyAskAnswerValue =
  | { kind: 'account', account: CounterpartyAskAccount }
  | { kind: 'text', text: string }

const toAnswer = (value: CounterpartyAskAnswerValue): CounterpartyAskAnswer =>
  value.kind === 'account'
    ? { accountIdentifier: value.account.accountIdentifier }
    : { userResponse: value.text }

export const getCounterpartyAskAnswerLabel = (value: CounterpartyAskAnswerValue) =>
  value.kind === 'account' ? value.account.name : value.text

export const areCounterpartyAskAnswersEqual = (
  left: CounterpartyAskAnswerValue,
  right: CounterpartyAskAnswerValue,
) => {
  if (left.kind === 'account' && right.kind === 'account') {
    return AccountIdentifierEquivalence(
      left.account.accountIdentifier,
      right.account.accountIdentifier,
    )
  }

  if (left.kind === 'text' && right.kind === 'text') {
    return left.text === right.text
  }

  return false
}

export const collapseUniformCounterpartyAskAnswers = (
  answers: readonly CounterpartyAskAnswerValue[],
): CounterpartyAskAnswerValue | null => {
  const [first, ...rest] = answers

  if (!first) return null

  return rest.every(answer => areCounterpartyAskAnswersEqual(first, answer)) ? first : null
}

export const countDistinctCounterpartyAskAnswers = (
  answers: readonly CounterpartyAskAnswerValue[],
) =>
  answers.reduce<CounterpartyAskAnswerValue[]>((distinct, answer) => {
    return distinct.some(seen => areCounterpartyAskAnswersEqual(seen, answer))
      ? distinct
      : [...distinct, answer]
  }, []).length

export const buildAllSameCounterpartyAskResponse = (
  answer: CounterpartyAskAnswerValue,
  alwaysThis: boolean,
): CounterpartyAskResponse => ({ ...toAnswer(answer), alwaysThis })

export type CounterpartyAskTransactionAnswerEntry = {
  transactionId: string
  answer: CounterpartyAskAnswerValue
}

export const buildItemisedCounterpartyAskResponse = (
  entries: readonly CounterpartyAskTransactionAnswerEntry[],
): CounterpartyAskResponse | null => {
  const [first, ...rest] = entries

  if (!first) return null

  return {
    transactionResponses: [
      { transactionId: first.transactionId, ...toAnswer(first.answer) },
      ...rest.map(({ transactionId, answer }) => ({ transactionId, ...toAnswer(answer) })),
    ],
  }
}
