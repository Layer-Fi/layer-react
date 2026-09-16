import { AccountIdentifierEquivalence } from '@schemas/common/accountIdentifier'
import {
  type CounterpartyAskAnswer,
  type CounterpartyAskResponse,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskResponse'
import { type CounterpartyAskAccount } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'

export type CounterpartyAskAnswerValue =
  | { kind: 'account', account: CounterpartyAskAccount }
  | { kind: 'text', text: string }

// `user_response` is a NonEmptyTrimmedString on the wire, so encoding throws on
// anything the user leaves padded; normalise before it reaches the schema.
const getAnswerText = (value: Extract<CounterpartyAskAnswerValue, { kind: 'text' }>) =>
  value.text.trim()

const toAnswer = (value: CounterpartyAskAnswerValue): CounterpartyAskAnswer =>
  value.kind === 'account'
    ? { accountIdentifier: value.account.accountIdentifier }
    : { userResponse: getAnswerText(value) }

export const getCounterpartyAskAnswerLabel = (value: CounterpartyAskAnswerValue) =>
  value.kind === 'account' ? value.account.name : getAnswerText(value)

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
    return getAnswerText(left) === getAnswerText(right)
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
  answers.filter(
    (answer, index) =>
      answers.findIndex(seen => areCounterpartyAskAnswersEqual(seen, answer)) === index,
  ).length

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
  const [first, ...rest] = entries.map(
    ({ transactionId, answer }) => ({ transactionId, ...toAnswer(answer) }),
  )

  if (!first) return null

  return { transactionResponses: [first, ...rest] }
}
