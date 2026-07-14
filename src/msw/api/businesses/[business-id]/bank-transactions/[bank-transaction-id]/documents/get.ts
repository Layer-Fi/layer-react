import { type DocumentS3Urls } from '@internal-types/bankTransactions'

import { findDocuments } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/documents/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const toResponse = (documents: DocumentS3Urls) => apiData(documents)

export const get = createMockEndpoint<DocumentS3Urls, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bank-transactions/:bankTransactionId/documents',
  resolve: ({ override, params }) => {
    if (override) return toResponse(override)

    const { documentUrls } = findDocuments(params.bankTransactionId as string)

    return toResponse({ type: 'Document_S3_Urls', documentUrls })
  },
})
