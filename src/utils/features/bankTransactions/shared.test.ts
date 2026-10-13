import { describe, expect, it } from 'vitest'

import { TransactionSource } from '@schemas/features/bankTransactions/base'
import { getBankTransactionDisplayName } from '@utils/features/bankTransactions/shared'

describe('getBankTransactionDisplayName', () => {
  it('prefers the counterparty name for bank-fed transactions', () => {
    expect(getBankTransactionDisplayName({
      source: TransactionSource.PLAID,
      counterpartyName: 'Starbucks',
      description: 'SQ *STARBUCKS 1234 SEATTLE WA',
    })).toBe('Starbucks')
  })

  it.each([null, '', '   '])('falls back to the description when the counterparty name is %j', (counterpartyName) => {
    expect(getBankTransactionDisplayName({
      source: TransactionSource.PLAID,
      counterpartyName,
      description: 'SQ *STARBUCKS 1234 SEATTLE WA',
    })).toBe('SQ *STARBUCKS 1234 SEATTLE WA')
  })

  it('shows the entered description for custom transactions', () => {
    expect(getBankTransactionDisplayName({
      source: TransactionSource.CUSTOM,
      counterpartyName: 'Acme Co',
      description: 'Office supplies',
    })).toBe('Office supplies')
  })

  it('falls back to the counterparty name for a custom transaction with a blank description', () => {
    expect(getBankTransactionDisplayName({
      source: TransactionSource.CUSTOM,
      counterpartyName: 'Acme Co',
      description: ' ',
    })).toBe('Acme Co')
  })
})
