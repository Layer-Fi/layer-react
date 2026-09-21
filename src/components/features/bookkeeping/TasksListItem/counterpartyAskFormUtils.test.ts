import { describe, expect, it } from 'vitest'

import { makeAccountId, makeStableName } from '@schemas/common/accountIdentifier'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import {
  buildCounterpartyAskSubmission,
  getCounterpartyAskFormDefaultValues,
  getStoredCounterpartyAskAnswerSummary,
  getWholeAnswer,
  MIX_ANSWER_KEY,
  OTHER_ANSWER_KEY,
  toSuggestionAnswerKey,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'

import { bankTransactionCategories } from '@fixtures/bankTransactions/constants'
import { makeCounterpartyAskTask } from '@fixtures/bookkeeping/counterpartyAskTasks'

const MEALS = makeStableName(bankTransactionCategories.meals.stableName)
const OFFICE = makeAccountId(bankTransactionCategories.officeExpenses.id)

const twoTransactions = (): Partial<CounterpartyAskTask> => ({
  transactions: [
    { id: 'txn-1', date: new Date('2025-02-03T00:00:00.000Z'), amount: 61250, description: 'COSTCO WHSE', direction: 'DEBIT', counterpartyName: 'Costco' },
    { id: 'txn-2', date: new Date('2025-02-19T00:00:00.000Z'), amount: 22395, description: 'COSTCO GAS', direction: 'DEBIT', counterpartyName: 'Costco' },
  ] as CounterpartyAskTask['transactions'],
  transactionResponses: [],
})

describe('getStoredCounterpartyAskAnswerSummary', () => {
  it('reports nothing for an unanswered task', () => {
    expect(getStoredCounterpartyAskAnswerSummary(makeCounterpartyAskTask())).toBeNull()
  })

  it('prefers the whole-task account over row answers', () => {
    const task = makeCounterpartyAskTask({
      status: BusinessTaskStatus.UserMarkedCompleted,
      responseAccount: { accountIdentifier: OFFICE, name: 'Office Expenses' },
    })

    expect(getStoredCounterpartyAskAnswerSummary(task)).toEqual({ kind: 'account', name: 'Office Expenses' })
  })

  it('treats answered rows as itemised', () => {
    const task = makeCounterpartyAskTask({
      ...twoTransactions(),
      transactionResponses: [{ transactionId: 'txn-1', userResponse: 'Gas', responseAccount: null }],
    })

    expect(getStoredCounterpartyAskAnswerSummary(task)).toEqual({ kind: 'itemised' })
  })
})

describe('getCounterpartyAskFormDefaultValues', () => {
  it('seeds a stored account answer by its suggestion key and remembers the going-forward choice', () => {
    const task = makeCounterpartyAskTask({
      responseAccount: { accountIdentifier: OFFICE, name: 'Office Expenses' },
      alwaysThis: true,
    })

    const defaults = getCounterpartyAskFormDefaultValues(task)

    expect(defaults.picker.answerKey).toBe(toSuggestionAnswerKey(0))
    expect(defaults.remember.goingForward).toBe('always')
  })

  it('seeds stored free text', () => {
    const defaults = getCounterpartyAskFormDefaultValues(makeCounterpartyAskTask({ userResponse: 'Team lunch' }))

    expect(defaults).toMatchObject({ picker: { answerKey: OTHER_ANSWER_KEY }, freeText: { text: 'Team lunch' }, remember: { goingForward: 'ask' } })
  })

  it('seeds itemised rows from the per-transaction responses', () => {
    const task = makeCounterpartyAskTask({
      ...twoTransactions(),
      transactionResponses: [
        { transactionId: 'txn-1', userResponse: null, responseAccount: { accountIdentifier: OFFICE, name: 'Office Expenses' } },
        { transactionId: 'txn-2', userResponse: 'Gas for the van', responseAccount: null },
      ],
    })

    const defaults = getCounterpartyAskFormDefaultValues(task)

    expect(defaults.picker.answerKey).toBe(MIX_ANSWER_KEY)
    expect(defaults.remember.goingForward).toBeNull()
    expect(defaults.itemised.rows).toEqual([
      { transactionId: 'txn-1', answerKey: toSuggestionAnswerKey(0), text: '' },
      { transactionId: 'txn-2', answerKey: OTHER_ANSWER_KEY, text: 'Gas for the van' },
    ])
  })
})

describe('getWholeAnswer', () => {
  it('collapses itemised rows only once every row agrees', () => {
    const task = makeCounterpartyAskTask(twoTransactions())
    const partial = getCounterpartyAskFormDefaultValues(task)
    partial.picker.answerKey = MIX_ANSWER_KEY
    partial.itemised.rows[0]!.answerKey = toSuggestionAnswerKey(2)

    expect(getWholeAnswer(task.suggestions, partial)).toBeNull()

    partial.itemised.rows[1]!.answerKey = toSuggestionAnswerKey(2)

    expect(getWholeAnswer(task.suggestions, partial)).toEqual({ kind: 'account', account: task.suggestions[2] })
  })
})

describe('buildCounterpartyAskSubmission', () => {
  it('sends one account for the whole task with the going-forward flag', () => {
    const task = makeCounterpartyAskTask()
    const values = { ...getCounterpartyAskFormDefaultValues(task), picker: { answerKey: toSuggestionAnswerKey(2) }, remember: { goingForward: 'always' as const } }

    expect(buildCounterpartyAskSubmission(task, values)).toEqual({
      response: { accountIdentifier: MEALS, alwaysThis: true },
      answer: { kind: 'account', name: 'Business Meals' },
      wasCategorized: true,
    })
  })

  it('sends free text without categorizing', () => {
    const task = makeCounterpartyAskTask()
    const values = { ...getCounterpartyAskFormDefaultValues(task), picker: { answerKey: OTHER_ANSWER_KEY }, freeText: { text: ' Team lunch ' }, remember: { goingForward: 'ask' as const } }

    expect(buildCounterpartyAskSubmission(task, values)).toEqual({
      response: { userResponse: 'Team lunch', alwaysThis: false },
      answer: { kind: 'text' },
      wasCategorized: false,
    })
  })

  it('sends itemised rows when no going-forward choice was made', () => {
    const task = makeCounterpartyAskTask(twoTransactions())
    const values = getCounterpartyAskFormDefaultValues(task)
    values.picker.answerKey = MIX_ANSWER_KEY
    values.itemised.rows[0]!.answerKey = toSuggestionAnswerKey(0)
    values.itemised.rows[1]!.answerKey = OTHER_ANSWER_KEY
    values.itemised.rows[1]!.text = 'Gas'

    expect(buildCounterpartyAskSubmission(task, values)).toEqual({
      response: {
        transactionResponses: [
          { transactionId: 'txn-1', accountIdentifier: OFFICE },
          { transactionId: 'txn-2', userResponse: 'Gas' },
        ],
      },
      answer: { kind: 'itemised' },
      wasCategorized: false,
    })
  })

  it('returns null while the answer is incomplete', () => {
    const task = makeCounterpartyAskTask()

    expect(buildCounterpartyAskSubmission(task, getCounterpartyAskFormDefaultValues(task))).toBeNull()
  })
})
