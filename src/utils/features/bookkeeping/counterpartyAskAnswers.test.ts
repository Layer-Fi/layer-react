import { describe, expect, it } from 'vitest'

import { makeAccountId, makeStableName } from '@schemas/common/accountIdentifier'
import {
  buildAllSameCounterpartyAskResponse,
  buildItemisedCounterpartyAskResponse,
  collapseUniformCounterpartyAskAnswers,
  countDistinctCounterpartyAskAnswers,
  type CounterpartyAskAnswerValue,
} from '@utils/features/bookkeeping/counterpartyAskAnswers'

const MEALS: CounterpartyAskAnswerValue = {
  kind: 'account',
  account: { accountIdentifier: makeStableName('MEALS'), name: 'Business Meals' },
}

const OFFICE: CounterpartyAskAnswerValue = {
  kind: 'account',
  account: {
    accountIdentifier: makeAccountId('00000000-0000-4000-8000-000000000801'),
    name: 'Office Expenses',
  },
}

const TEXT_MEALS: CounterpartyAskAnswerValue = { kind: 'text', text: 'Business Meals' }

describe('collapseUniformCounterpartyAskAnswers', () => {
  it('collapses a set of identical account answers to a single answer', () => {
    expect(collapseUniformCounterpartyAskAnswers([MEALS, MEALS, MEALS])).toEqual(MEALS)
  })

  it('does not collapse differing account answers', () => {
    expect(collapseUniformCounterpartyAskAnswers([MEALS, OFFICE])).toBeNull()
  })

  it('does not collapse a chip and identical typed text', () => {
    expect(collapseUniformCounterpartyAskAnswers([MEALS, TEXT_MEALS])).toBeNull()
  })

  it('returns null for an empty set', () => {
    expect(collapseUniformCounterpartyAskAnswers([])).toBeNull()
  })
})

describe('countDistinctCounterpartyAskAnswers', () => {
  it('counts by identifier rather than label', () => {
    expect(countDistinctCounterpartyAskAnswers([MEALS, MEALS, TEXT_MEALS, OFFICE])).toBe(3)
  })
})

describe('buildAllSameCounterpartyAskResponse', () => {
  it('sends an account identifier without free text', () => {
    expect(buildAllSameCounterpartyAskResponse(MEALS, true)).toEqual({
      accountIdentifier: makeStableName('MEALS'),
      alwaysThis: true,
    })
  })

  it('sends free text without an account identifier', () => {
    expect(buildAllSameCounterpartyAskResponse(TEXT_MEALS, false)).toEqual({
      userResponse: 'Business Meals',
      alwaysThis: false,
    })
  })
})

describe('buildItemisedCounterpartyAskResponse', () => {
  it('sends one answer per transaction and never always_this', () => {
    const response = buildItemisedCounterpartyAskResponse([
      { transactionId: 'txn-1', answer: MEALS },
      { transactionId: 'txn-2', answer: TEXT_MEALS },
    ])

    expect(response).toEqual({
      transactionResponses: [
        { transactionId: 'txn-1', accountIdentifier: makeStableName('MEALS') },
        { transactionId: 'txn-2', userResponse: 'Business Meals' },
      ],
    })
    expect(response).not.toHaveProperty('alwaysThis')
  })

  it('returns null rather than an empty itemised body', () => {
    expect(buildItemisedCounterpartyAskResponse([])).toBeNull()
  })
})
