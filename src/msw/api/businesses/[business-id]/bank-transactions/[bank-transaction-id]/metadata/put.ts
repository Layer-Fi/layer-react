import { Schema } from 'effect'

import { type BankTransactionMetadata } from '@internal-types/bankTransactions'
import { BankTransactionMemoUpdateSchema } from '@schemas/bankTransactions/metadataUpdate'

import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const decodeUpdateMetadataBody = Schema.decodeUnknownSync(BankTransactionMemoUpdateSchema)

const toResponse = (metadata: BankTransactionMetadata) => apiData(metadata)

export const put = createMockEndpoint<BankTransactionMetadata, ReturnType<typeof toResponse>>({
  method: 'put',
  path: '*/v1/businesses/:businessId/bank-transactions/:bankTransactionId/metadata',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const { memo } = decodeUpdateMetadataBody(await readRequestJson(request))

    bankTransactionStore.save({
      ...findOrSeedBankTransaction(params.bankTransactionId as string),
      memo,
    })

    return toResponse({ memo })
  },
})
