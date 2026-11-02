import { describe, expect, it } from 'vitest'

import { getBankTransactionDisplayName } from '@utils/features/bankTransactions/shared'

describe('getBankTransactionDisplayName', () => {
  it('prefers the counterparty name', () => {
    expect(getBankTransactionDisplayName({
      counterpartyName: 'Starbucks',
      description: 'SQ *STARBUCKS 1234 SEATTLE WA',
    })).toBe('Starbucks')
  })

  it.each([null, '', '   '])('falls back to the description when the counterparty name is %j', (counterpartyName) => {
    expect(getBankTransactionDisplayName({
      counterpartyName,
      description: 'SQ *STARBUCKS 1234 SEATTLE WA',
    })).toBe('SQ *STARBUCKS 1234 SEATTLE WA')
  })
})
