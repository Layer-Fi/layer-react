import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { BankTransactionDirection, BankTransactionDirectionSchema } from '@schemas/bankTransactions/base'

const decode = Schema.decodeUnknownSync(BankTransactionDirectionSchema)
const encode = Schema.encodeSync(BankTransactionDirectionSchema)

describe('BankTransactionDirectionSchema', () => {
  it('decodes the legacy CREDIT/DEBIT encoding', () => {
    expect(decode('CREDIT')).toBe(BankTransactionDirection.MoneyIn)
    expect(decode('DEBIT')).toBe(BankTransactionDirection.MoneyOut)
  })

  it('decodes the MONEY_IN/MONEY_OUT encoding', () => {
    expect(decode('MONEY_IN')).toBe(BankTransactionDirection.MoneyIn)
    expect(decode('MONEY_OUT')).toBe(BankTransactionDirection.MoneyOut)
  })

  it('rejects unknown encodings', () => {
    expect(() => decode('INBOUND')).toThrow()
  })

  it('encodes as MONEY_IN/MONEY_OUT', () => {
    expect(encode(BankTransactionDirection.MoneyIn)).toBe('MONEY_IN')
    expect(encode(BankTransactionDirection.MoneyOut)).toBe('MONEY_OUT')
  })
})
