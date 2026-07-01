import { Schema } from 'effect'

import { type BankAccount, BankAccountSchema } from '@schemas/bankAccounts/bankAccount'

import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { bankAccounts as defaultBankAccounts } from '@fixtures/generated/bankAccounts.gen'

const encodeBankAccount = Schema.encodeSync(BankAccountSchema)

const toResponse = (bankAccounts: readonly BankAccount[]) => ({
  data: bankAccounts.map(account => encodeBankAccount(account)),
})

export const get = createMockEndpoint<readonly BankAccount[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bank-accounts',
  resolve: ({ override: bankAccounts = defaultBankAccounts }) => toResponse(bankAccounts),
})
