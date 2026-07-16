import { Schema } from 'effect'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeBankTransaction } from '@fixtures/bankTransactions/mocks'

const encodeBankTransaction = Schema.encodeSync(BankTransactionSchema)

export const toRecordCustomAccountTransactionResponse = (bankTransaction: BankTransaction) =>
  apiData(encodeBankTransaction(bankTransaction))

export const post = createMockEndpoint<BankTransaction, ReturnType<typeof toRecordCustomAccountTransactionResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/custom-accounts/:customAccountId/transactions/record',
  resolve: ({ override: bankTransaction = makeBankTransaction() }) =>
    toRecordCustomAccountTransactionResponse(bankTransaction),
})
