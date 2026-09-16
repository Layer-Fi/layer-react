import { bankTransactionDocumentsStore, findDocuments } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/documents/store'
import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const toResponse = () => apiData({})

export const post = createMockEndpoint<Record<string, never>, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/bank-transactions/:bankTransactionId/documents/:documentId/archive',
  resolve: ({ params }) => {
    const bankTransactionId = params.bankTransactionId as string
    const documentId = params.documentId as string

    const documents = findDocuments(bankTransactionId)
    bankTransactionDocumentsStore.save({
      ...documents,
      documentUrls: documents.documentUrls.filter(url => url.documentId !== documentId),
    })

    const transaction = findOrSeedBankTransaction(bankTransactionId)
    bankTransactionStore.save({
      ...transaction,
      documentIds: transaction.documentIds.filter(id => id !== documentId),
    })

    return toResponse()
  },
})
