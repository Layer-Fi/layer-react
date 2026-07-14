import { type FastCheck } from 'effect'

import {
  bankTransactionMerchants,
  bankTransactionSourceAccountIds,
} from '@fixtures/bankTransactions/constants'
import { institutionNames } from '@fixtures/constants/bank/institutionNames'
import { customers as customerPool } from '@fixtures/generated/customers.gen'
import { vendors as vendorPool } from '@fixtures/generated/vendors.gen'
import { nullableConstantFrom } from '@fixtures/utils/arbitrary/nullableConstantFrom'

export const bankTransactionCustomerArbitrary = nullableConstantFrom(
  customerPool,
  { nullWeight: 3, valueWeight: 1 },
)

export const bankTransactionVendorArbitrary = nullableConstantFrom(
  vendorPool,
  { nullWeight: 3, valueWeight: 1 },
)

export const sourceTransactionIdArbitrary = (fc: typeof FastCheck) =>
  fc.integer({ min: 100000, max: 999999 }).map(n => `src_txn_${n}`)

export const sourceAccountIdArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...bankTransactionSourceAccountIds)

export const accountInstitutionArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...institutionNames).map(name => ({ name, logo: null }))

export type BankTransactionRolls = {
  merchantIndex: number
  statusRoll: number
  ref: number
  amountRoll: number
  splitPercent: number
}

// noBias keeps the rolls uniform; fast-check otherwise skews samples
// toward the minimum, collapsing the status/amount distributions.
export const bankTransactionRollsArbitrary = (
  fc: typeof FastCheck,
): FastCheck.Arbitrary<BankTransactionRolls> =>
  fc.record({
    merchantIndex: fc.noBias(fc.nat(bankTransactionMerchants.length - 1)),
    statusRoll: fc.noBias(fc.nat(99)),
    ref: fc.noBias(fc.integer({ min: 100000, max: 999999 })),
    amountRoll: fc.noBias(fc.nat(999999)),
    splitPercent: fc.noBias(fc.integer({ min: 20, max: 80 })),
  })
