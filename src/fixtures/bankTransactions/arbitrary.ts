import { type FastCheck } from 'effect'

import { bankTransactionSourceAccountIds } from '@fixtures/bankTransactions/constants'
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
