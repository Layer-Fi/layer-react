import { Schema } from 'effect'

import { BulkMatchOrCategorizeRequestSchema } from '@schemas/bankTransactions/bulkMatchOrCategorize'

import { applyCategoryUpdate, applyConfirmedMatch } from '@msw/api/businesses/[business-id]/bank-transactions/applyCategoryUpdate'
import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const decodeBulkMatchOrCategorizeBody = Schema.decodeUnknownSync(BulkMatchOrCategorizeRequestSchema)

const toResponse = () => apiData({})

export const post = createMockEndpoint<Record<string, never>, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/bank-transactions/bulk-match-or-categorize',
  resolve: async ({ request }) => {
    const body = decodeBulkMatchOrCategorizeBody(await readRequestJson(request))

    Object.entries(body.transactions).forEach(([transactionId, update]) => {
      const transaction = findOrSeedBankTransaction(transactionId)

      bankTransactionStore.save(
        update.type === 'match'
          ? applyConfirmedMatch(transaction, update.suggestedMatchId).transaction
          : applyCategoryUpdate(transaction, update.categorization),
      )
    })

    return toResponse()
  },
})
