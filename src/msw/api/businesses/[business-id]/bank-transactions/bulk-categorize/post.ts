import { Schema } from 'effect'

import { BulkCategorizeRequestSchema } from '@schemas/bankTransactions/bulkCategorize'

import { applyCategoryUpdate } from '@msw/api/businesses/[business-id]/bank-transactions/applyCategoryUpdate'
import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const decodeBulkCategorizeBody = Schema.decodeUnknownSync(BulkCategorizeRequestSchema)

const toResponse = () => apiData({})

export const post = createMockEndpoint<Record<string, never>, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/bank-transactions/bulk-categorize',
  resolve: async ({ request }) => {
    const body = decodeBulkCategorizeBody(await readRequestJson(request))

    body.transactions.forEach(({ transactionId, categorization }) => {
      bankTransactionStore.save(
        applyCategoryUpdate(findOrSeedBankTransaction(transactionId), categorization),
      )
    })

    return toResponse()
  },
})
