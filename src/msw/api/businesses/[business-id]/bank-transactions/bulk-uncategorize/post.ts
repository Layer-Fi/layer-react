import { Schema } from 'effect'

import { BulkUncategorizeRequestSchema } from '@schemas/bankTransactions/bulkUncategorize'

import { applyUncategorize } from '@msw/api/businesses/[business-id]/bank-transactions/applyCategoryUpdate'
import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const decodeBulkUncategorizeBody = Schema.decodeUnknownSync(BulkUncategorizeRequestSchema)

const toResponse = () => apiData({})

export const post = createMockEndpoint<Record<string, never>, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/bank-transactions/bulk-uncategorize',
  resolve: async ({ request }) => {
    const { transactionIds } = decodeBulkUncategorizeBody(await readRequestJson(request))

    transactionIds.forEach((transactionId) => {
      bankTransactionStore.save(applyUncategorize(findOrSeedBankTransaction(transactionId)))
    })

    return toResponse()
  },
})
