import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { SuggestedMatchSchema } from '@schemas/features/bankTransactions/match'
import { MatchDetailsWithFallbackSchema } from '@schemas/features/bankTransactions/matchDetails'

const decodeSuggestedMatch = Schema.decodeUnknownSync(SuggestedMatchSchema)
const decodeMatchDetails = Schema.decodeUnknownSync(MatchDetailsWithFallbackSchema)

const buildDetails = (overrides: Record<string, unknown>) => ({
  id: 'match-details-1',
  amount: 12_500,
  date: '2025-01-15T00:00:00Z',
  description: 'Loan payment',
  adjustment: null,
  external_id: null,
  reference_number: null,
  ...overrides,
})

const buildSuggestedMatch = (overrides: Record<string, unknown>) => ({
  id: 'suggested-match-1',
  details: buildDetails(overrides),
})

describe('MatchDetailsWithFallbackSchema', () => {
  it('decodes a Loan_Payment_Match suggested match', () => {
    const suggestedMatch = decodeSuggestedMatch(buildSuggestedMatch({
      type: 'Loan_Payment_Match',
      loan_identifiers: { id: 'loan-payment-1', reference_number: 'LP-1' },
    }))

    expect(suggestedMatch.details).toMatchObject({
      type: 'Loan_Payment_Match',
      loanIdentifiers: { id: 'loan-payment-1', referenceNumber: 'LP-1' },
    })
  })

  it('decodes a Loan_Proceed_Match suggested match', () => {
    const suggestedMatch = decodeSuggestedMatch(buildSuggestedMatch({
      type: 'Loan_Proceed_Match',
      loan_identifiers: { id: 'loan-proceed-1' },
    }))

    expect(suggestedMatch.details).toMatchObject({
      type: 'Loan_Proceed_Match',
      loanIdentifiers: { id: 'loan-proceed-1' },
    })
  })

  it('decodes an unknown match detail type through the fallback', () => {
    const details = decodeMatchDetails(buildDetails({
      type: 'Some_New_Match',
      some_new_field: 'ignored',
    }))

    expect(details).toMatchObject({
      type: 'Some_New_Match',
      id: 'match-details-1',
      amount: 12_500,
      description: 'Loan payment',
    })
    expect(details.date).toEqual(new Date('2025-01-15T00:00:00Z'))
  })

  it('still decodes a known match detail type with its type-specific fields', () => {
    const details = decodeMatchDetails(buildDetails({
      type: 'Transfer_Match',
      from_account_name: 'Checking',
      to_account_name: 'Savings',
    }))

    expect(details).toMatchObject({
      type: 'Transfer_Match',
      fromAccountName: 'Checking',
      toAccountName: 'Savings',
    })
  })
})
