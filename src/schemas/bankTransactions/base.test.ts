import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { BankTransactionDirection, BankTransactionDirectionSchema } from '@schemas/bankTransactions/base'

const decode = Schema.decodeUnknownSync(BankTransactionDirectionSchema)
const encode = Schema.encodeSync(BankTransactionDirectionSchema)

describe('BankTransactionDirectionSchema', () => {
  it('decodes the legacy CREDIT/DEBIT encoding', () => {
    expect(decode('CREDIT')).toBe(BankTransactionDirection.Credit)
    expect(decode('DEBIT')).toBe(BankTransactionDirection.Debit)
  })

  it('decodes the MONEY_IN/MONEY_OUT encoding', () => {
    expect(decode('MONEY_IN')).toBe(BankTransactionDirection.Credit)
    expect(decode('MONEY_OUT')).toBe(BankTransactionDirection.Debit)
  })

  it('rejects unknown encodings', () => {
    expect(() => decode('INBOUND')).toThrow()
  })

  it('encodes as CREDIT/DEBIT until the backend migrates', () => {
    expect(encode(BankTransactionDirection.Credit)).toBe('CREDIT')
    expect(encode(BankTransactionDirection.Debit)).toBe('DEBIT')
  })
})
