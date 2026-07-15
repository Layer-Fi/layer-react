import { type FastCheck } from 'effect'

import { bankTransactionMerchants } from '@fixtures/bankTransactions/constants'
import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'
import { createRollTable } from '@fixtures/utils/createRollTable'

export enum BankTransactionRollCase {
  MatchedTransfer = 'MATCHED_TRANSFER',
  SuggestedTransfer = 'SUGGESTED_TRANSFER',
  Pending = 'PENDING',
  AwaitingInput = 'AWAITING_INPUT',
  Categorized = 'CATEGORIZED',
  Split = 'SPLIT',
  MerchantMatch = 'MERCHANT_MATCH',
}

export const bankTransactionRollTable = createRollTable<BankTransactionRollCase>([
  [BankTransactionRollCase.MatchedTransfer, 6],
  [BankTransactionRollCase.SuggestedTransfer, 6],
  [BankTransactionRollCase.Pending, 4],
  [BankTransactionRollCase.AwaitingInput, 34],
  [BankTransactionRollCase.Categorized, 30],
  [BankTransactionRollCase.Split, 10],
  [BankTransactionRollCase.MerchantMatch, 10],
])

/*
 * The rolls are the single draw of randomness behind every correlated field:
 * the chosen merchant fixes direction, amount range, description, and
 * category suggestions together, and statusRoll picks the roll table case,
 * so the derived fields always agree.
 */
export type BankTransactionRolls = {
  accountIndex: number
  merchantIndex: number
  statusRoll: number
  ref: number
  amountRoll: number
  splitPercent: number
}

export const bankTransactionRollsArbitrary = (
  fc: typeof FastCheck,
): FastCheck.Arbitrary<BankTransactionRolls> =>
  fc.record({
    accountIndex: fc.noBias(fc.nat(bankAccounts.length - 1)),
    merchantIndex: fc.noBias(fc.nat(bankTransactionMerchants.length - 1)),
    statusRoll: bankTransactionRollTable.rollArbitrary(fc),
    ref: fc.noBias(fc.integer({ min: 100000, max: 999999 })),
    amountRoll: fc.noBias(fc.nat(999999)),
    splitPercent: fc.noBias(fc.integer({ min: 20, max: 80 })),
  })
