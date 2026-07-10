import { Schema } from 'effect'

import { type BankAccount, BankAccountSchema } from '@schemas/bankAccounts/bankAccount'

import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeBankAccount = Schema.encodeSync(BankAccountSchema)

const toResponse = (bankAccounts: readonly BankAccount[]) => ({
  data: bankAccounts.map(account => encodeBankAccount(account)),
})

export const get = createMockEndpoint<readonly BankAccount[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bank-accounts',
  resolve: ({ override: bankAccounts = bankAccountStore.all() }) => toResponse(bankAccounts),
})
