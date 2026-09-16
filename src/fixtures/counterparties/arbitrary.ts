import { type FastCheck } from 'effect'

import { bankTransactionMerchants } from '@fixtures/bankTransactions/constants'

// Drawing from the bank transaction merchants keeps counterparty pickers
// aligned with generated transaction data.
export const merchantNameArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...bankTransactionMerchants.map(({ name }) => name))

export const mccArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom('5734', '5942', '6012', '5411', '4511', '7399')
