import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'

import { makeBankTransaction } from '@fixtures/bankTransactions/mocks'
import { bankTransactions } from '@fixtures/generated/bankTransactions.gen'
import { createMockStore } from '@msw/utils/createMockStore'

export const bankTransactionStore = createMockStore<BankTransaction>(() => bankTransactions)

/*
 * Action handlers (categorize, match, metadata, tags, documents) mutate a
 * transaction in place. Seed a fallback when the id isn't in the store, so the
 * mutation is always reflected in the transaction the UI reads back.
 */
export const findOrSeedBankTransaction = (bankTransactionId: string) =>
  bankTransactionStore.findById(bankTransactionId) ?? makeBankTransaction({ id: bankTransactionId })
