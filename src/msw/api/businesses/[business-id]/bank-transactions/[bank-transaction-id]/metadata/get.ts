import { type BankTransactionMetadata } from '@internal-types/bankTransactions'

import { findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const toResponse = (metadata: BankTransactionMetadata) => apiData(metadata)

export const get = createMockEndpoint<BankTransactionMetadata, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bank-transactions/:bankTransactionId/metadata',
  resolve: ({ override, params }) => {
    if (override) return toResponse(override)

    const transaction = findOrSeedBankTransaction(params.bankTransactionId as string)

    return toResponse({ memo: transaction.memo ?? null })
  },
})
