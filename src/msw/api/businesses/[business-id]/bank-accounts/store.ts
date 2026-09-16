import { type BankAccount } from '@schemas/features/bankAccounts/bankAccount'

import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'
import { createMockStore } from '@msw/utils/createMockStore'

export const bankAccountStore = createMockStore<BankAccount>(() => bankAccounts)
