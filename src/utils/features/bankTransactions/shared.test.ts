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

  it('falls back to the description when there is no counterparty name', () => {
    expect(getBankTransactionDisplayName({
      source: TransactionSource.PLAID,
      counterpartyName: null,
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
})
