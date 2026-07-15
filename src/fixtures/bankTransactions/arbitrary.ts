import { type FastCheck } from 'effect'

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
