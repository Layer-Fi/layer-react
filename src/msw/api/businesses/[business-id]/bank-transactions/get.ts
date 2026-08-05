import { Schema } from 'effect'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'

import { filterBankTransactions, sortBankTransactions } from '@msw/api/businesses/[business-id]/bank-transactions/listQuery'
import { bankTransactionStore } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeBankTransaction = Schema.encodeSync(BankTransactionSchema)

const toResponse = (transactions: readonly BankTransaction[], request: Request) =>
  paginatedApiData(transactions.map(transaction => encodeBankTransaction(transaction)), request)

export const get = createMockEndpoint<readonly BankTransaction[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bank-transactions',
  resolve: ({ override: transactions = bankTransactionStore.all(), request }) =>
    toResponse(
      sortBankTransactions(filterBankTransactions(transactions, request), request),
      request,
    ),
})
