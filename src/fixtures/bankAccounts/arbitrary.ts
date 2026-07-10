import { Arbitrary, type FastCheck } from 'effect'

import { accountNameKinds, institutions } from '@fixtures/bankAccounts/constants'
import { externalAccountConnectionSchema } from '@fixtures/bankAccounts/externalAccountConnectionSchema'
import { centsAmountArbitrary } from '@fixtures/utils/arbitrary/amount'

export const amountArbitrary = centsAmountArbitrary({ minDollars: 500, maxDollars: 25000 })

export const institutionArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...institutions)

export const accountNameKindArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...accountNameKinds)

export const balanceTimestampArbitrary = (fc: typeof FastCheck) =>
  amountArbitrary(fc).map(balance => ({ balance }))

// Exactly one connection per account - the same display details are mirrored
// onto every connection, so per-connection surfaces would show duplicate rows.
export const externalAccountsArbitrary = (fc: typeof FastCheck) =>
  fc.array(Arbitrary.make(externalAccountConnectionSchema), { minLength: 1, maxLength: 1 })

export const isDisconnectedArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant(false), weight: 4 },
    { arbitrary: fc.constant(true), weight: 1 },
  )

export const notificationsArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant([]), weight: 4 },
    { arbitrary: fc.constant([{ type: 'ACCOUNT_DISCONNECTED' }]), weight: 1 },
  )
