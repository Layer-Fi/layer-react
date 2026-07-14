import { type BankTransaction } from '@internal-types/bankTransactions'

import { createMockStore } from '@msw/utils/createMockStore'
import { bankTransactions } from '@fixtures/generated/bankTransactions.gen'

export const bankTransactionStore = createMockStore<BankTransaction>(() => bankTransactions)
