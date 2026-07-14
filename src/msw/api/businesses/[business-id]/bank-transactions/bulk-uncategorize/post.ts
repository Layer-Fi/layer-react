import { Schema } from 'effect'

import { applyUncategorize } from '@msw/api/businesses/[business-id]/bank-transactions/applyCategoryUpdate'
import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const BulkUncategorizeBodySchema = Schema.Struct({
  transaction_ids: Schema.Array(Schema.String),
})

const decodeBulkUncategorizeBody = Schema.decodeUnknownSync(BulkUncategorizeBodySchema)

const toResponse = () => apiData({})

export const post = createMockEndpoint<Record<string, never>, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/bank-transactions/bulk-uncategorize',
  resolve: async ({ request }) => {
    const { transaction_ids: transactionIds } = decodeBulkUncategorizeBody(await readRequestJson(request))

    transactionIds.forEach((transactionId) => {
      bankTransactionStore.save(applyUncategorize(findOrSeedBankTransaction(transactionId)))
    })

    return toResponse()
  },
})
