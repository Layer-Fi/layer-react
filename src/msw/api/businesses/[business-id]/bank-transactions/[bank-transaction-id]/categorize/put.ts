import { Schema } from 'effect'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'
import { CategoryUpdateSchema } from '@schemas/bankTransactions/categoryUpdate'

import { applyCategoryUpdate } from '@msw/api/businesses/[business-id]/bank-transactions/applyCategoryUpdate'
import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const encodeBankTransaction = Schema.encodeSync(BankTransactionSchema)
const decodeCategoryUpdate = Schema.decodeUnknownSync(CategoryUpdateSchema)

const toResponse = (transaction: BankTransaction) => apiData(encodeBankTransaction(transaction))

export const put = createMockEndpoint<BankTransaction, ReturnType<typeof toResponse>>({
  method: 'put',
  path: '*/v1/businesses/:businessId/bank-transactions/:bankTransactionId/categorize',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const update = decodeCategoryUpdate(await readRequestJson(request))
    const transaction = applyCategoryUpdate(
      findOrSeedBankTransaction(params.bankTransactionId as string),
      update,
    )
    bankTransactionStore.save(transaction)

    return toResponse(transaction)
  },
})
