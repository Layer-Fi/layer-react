import { type BankAccount } from '@schemas/bankAccounts/bankAccount'

import { createMockStore } from '@msw/utils/createMockStore'
import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'

export const bankAccountStore = createMockStore<BankAccount>(() => bankAccounts)
